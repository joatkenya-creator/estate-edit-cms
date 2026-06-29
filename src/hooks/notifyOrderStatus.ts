import type { CollectionAfterChangeHook } from 'payload'

// Maps Payload order status values to the event names the storefront expects.
const STATUS_EVENT: Record<string, string> = {
  confirmed: 'confirmed',
  dispatched: 'dispatched',
  delivered: 'delivered',
  returned: 'returned',
  cancelled: 'cancelled',
}

/**
 * Fires POSTs to the storefront's /api/notify-status endpoint whenever an
 * order's fulfilment status or payment status changes, so the storefront can
 * email / SMS the customer (Resend / Africa's Talking).
 *
 * Skips on create (the public site fires the 'placed' notification itself).
 * Skips silently if STOREFRONT_URL or NOTIFY_SECRET are not set (local dev).
 *
 * The hook is async and AWAITS the requests (bounded by a 5s timeout): on
 * Vercel a fire-and-forget fetch can be cancelled when the function freezes
 * after the save response, dropping the notification.
 */
export const notifyOrderStatus: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
}) => {
  if (operation === 'create') return

  const statusChanged = doc.status !== previousDoc?.status
  const paymentStatusChanged = doc.payment_status !== previousDoc?.payment_status
  if (!statusChanged && !paymentStatusChanged) return

  // Both can change in one save — notify for each.
  const events: string[] = []
  if (statusChanged) {
    const e = STATUS_EVENT[doc.status as string]
    if (e) events.push(e)
  }
  if (
    paymentStatusChanged &&
    (doc.payment_status === 'paid' || doc.payment_status === 'partial')
  ) {
    events.push('payment_received')
  }
  if (events.length === 0) return

  const storefrontUrl = process.env.STOREFRONT_URL
  const notifySecret = process.env.NOTIFY_SECRET
  if (!storefrontUrl || !notifySecret) return

  const basePayload = {
    orderNumber: doc.order_number,
    fullName: doc.full_name,
    phone: doc.phone,
    email: doc.email ?? undefined,
    total: doc.total,
    currency: doc.currency ?? 'KES',
    amountPaid: doc.amount_paid ?? undefined,
  }

  await Promise.allSettled(
    events.map(async (event) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)
      try {
        await fetch(`${storefrontUrl}/api/notify-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${notifySecret}`,
          },
          body: JSON.stringify({ event, ...basePayload }),
          signal: controller.signal,
        })
      } catch (err) {
        console.error(`notifyOrderStatus (${event}) failed:`, err)
      } finally {
        clearTimeout(timer)
      }
    }),
  )
}
