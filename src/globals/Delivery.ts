import type { GlobalConfig } from 'payload'

import { isAuthenticated } from '../access/roles'

/**
 * Delivery — CMS-editable delivery settings the public site reads to (a) show
 * the "We deliver countrywide" trust messaging and (b) price the delivery fee
 * at checkout. A single global row; the public site reads it with the anon key
 * (RLS select granted in the orders RLS migration).
 */
export const Delivery: GlobalConfig = {
  slug: 'delivery',
  label: 'Delivery',
  admin: { group: 'Settings' },
  access: {
    // Public site reads delivery settings (fee + copy); only staff edit.
    read: () => true,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Offer countrywide delivery',
      defaultValue: true,
    },
    {
      name: 'message',
      type: 'text',
      label: 'Trust badge text',
      defaultValue: 'We deliver countrywide',
      admin: { description: 'Short line shown on product cards, detail pages and checkout.' },
    },
    {
      name: 'details',
      type: 'textarea',
      label: 'Delivery & returns copy',
      admin: { description: 'Longer explanation shown on the Delivery & Returns section.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'flat_fee',
          type: 'number',
          label: 'Flat delivery fee',
          defaultValue: 0,
          admin: { description: 'Default countrywide fee (KES) when no county rate matches.' },
        },
        {
          name: 'free_above',
          type: 'number',
          label: 'Free delivery above',
          admin: { description: 'Order subtotal (KES) at/above which delivery is free. Leave blank to disable.' },
        },
      ],
    },
    {
      name: 'county_rates',
      type: 'json',
      label: 'Per-county rates',
      admin: {
        description: 'Optional overrides, e.g. { "Nairobi": 300, "Mombasa": 800 }. Falls back to the flat fee.',
      },
    },
  ],
}
