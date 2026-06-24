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
          label: 'Base fee (county)',
          defaultValue: 800,
          admin: { description: 'Default county/distance base (KES) when no per-county rate is set.' },
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
      label: 'Per-county base rates',
      defaultValue: { Nairobi: 800 },
      admin: {
        description: 'Distance base per county, e.g. { "Nairobi": 800, "Mombasa": 1500 }. Falls back to the base fee.',
      },
    },
    {
      name: 'tier_surcharges',
      type: 'json',
      label: 'Size / weight surcharges',
      defaultValue: { standard: 0, medium: 400, large: 800, bulky: 1500 },
      admin: {
        description: 'Handling add-on per item size tier, e.g. { "standard": 0, "medium": 400, "large": 800, "bulky": 1500 }.',
      },
    },
    {
      name: 'fragile_surcharge',
      type: 'number',
      label: 'Fragile surcharge',
      defaultValue: 500,
      admin: { description: 'Extra (KES) added when an item is marked fragile.' },
    },
  ],
}
