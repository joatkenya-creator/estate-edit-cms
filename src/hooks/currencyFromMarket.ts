import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Keep an asset's `currency` in lockstep with its `market`, so pricing is always
 * native to the storefront it sells in: Kenya -> KES, Virginia (USA) -> USD.
 * `currency` is read-only in the admin; this hook is its single source of truth.
 */
export const currencyFromMarket: CollectionBeforeChangeHook = ({ data }) => {
  if (data) {
    data.currency = data.market === 'virginia' ? 'USD' : 'KES'
  }
  return data
}
