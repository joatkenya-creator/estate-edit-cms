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
      // Distance-based base fees for all 47 counties, anchored at the Nairobi
      // 800 floor and scaled by distance using Fargo/G4S domestic rate shape.
      defaultValue: {
        Nairobi: 800, Kiambu: 950, Kajiado: 950, Machakos: 1050, Makueni: 1150,
        "Murang'a": 950, Kirinyaga: 1050, Nyandarua: 1050, Nyeri: 1100, Laikipia: 1300,
        Embu: 1100, "Tharaka-Nithi": 1200, Meru: 1150, Kitui: 1200, Nakuru: 950,
        Narok: 1050, Bomet: 1250, Kericho: 1200, Nandi: 1400, "Uasin Gishu": 1150,
        "Elgeyo-Marakwet": 1300, Baringo: 1300, "Trans Nzoia": 1400, "West Pokot": 1600,
        Samburu: 1800, Turkana: 2500, Kakamega: 1200, Vihiga: 1250, Bungoma: 1450,
        Busia: 1450, Siaya: 1350, Kisumu: 1250, "Homa Bay": 1400, Migori: 1500,
        Kisii: 1250, Nyamira: 1300, Mombasa: 1500, Kwale: 1650, Kilifi: 1600,
        "Tana River": 1900, Lamu: 2000, "Taita-Taveta": 1500, Garissa: 2000,
        Wajir: 2500, Mandera: 2800, Marsabit: 2300, Isiolo: 1500,
      },
      admin: {
        description: 'Distance base per county (KSh). Falls back to the base fee. Tune any value freely.',
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
