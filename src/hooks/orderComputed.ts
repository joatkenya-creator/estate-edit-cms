import type { CollectionBeforeChangeHook } from 'payload'

type OrderItem = { price?: number | null; quantity?: number | null }
type Payment = { amount?: number | null }

const round2 = (n: number) => Math.round(n * 100) / 100

/** EE-XXXXXX human-friendly order number (time-based + random suffix). */
const makeOrderNumber = (): string => {
  const t = Date.now().toString(36).toUpperCase().slice(-5)
  const r = Math.floor(Math.random() * 36 * 36)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0')
  return `EE-${t}${r}`
}

/**
 * Keeps an order's derived fields consistent whoever writes it:
 *   - order_number : generated once if missing.
 *   - subtotal     : recomputed from `items` (price × quantity) when items present.
 *   - total        : subtotal + delivery_fee.
 *   - amount_paid / payment_status / paid_at : derived from the `payments` log,
 *     so recording a payment in admin updates the money state automatically.
 *
 * Payments are added by staff in the CMS AFTER delivery (no online gateway);
 * this is the ledger that records every payment received for an order.
 */
export const orderComputed: CollectionBeforeChangeHook = async ({ data }) => {
  const next = { ...data }

  if (!next.order_number) next.order_number = makeOrderNumber()

  // Subtotal from the denormalized cart lines (the public site writes `items`).
  if (Array.isArray(next.items)) {
    const subtotal = (next.items as OrderItem[]).reduce(
      (sum, it) => sum + (Number(it?.price) || 0) * (Number(it?.quantity) || 1),
      0,
    )
    next.subtotal = round2(subtotal)
  }

  const subtotal = Number(next.subtotal) || 0
  const deliveryFee = Number(next.delivery_fee) || 0
  next.total = round2(subtotal + deliveryFee)

  // Payment ledger → amount paid + status.
  const payments = (Array.isArray(next.payments) ? next.payments : []) as Payment[]
  const amountPaid = round2(payments.reduce((s, p) => s + (Number(p?.amount) || 0), 0))
  next.amount_paid = amountPaid

  if (amountPaid <= 0) next.payment_status = 'unpaid'
  else if (amountPaid + 0.001 < next.total) next.payment_status = 'partial'
  else next.payment_status = 'paid'

  next.paid_at = next.payment_status === 'paid' && payments.length ? new Date().toISOString() : next.paid_at ?? null

  return next
}
