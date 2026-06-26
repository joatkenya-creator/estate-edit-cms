import type { GlobalConfig } from 'payload'

import { isAuthenticated } from '../access/roles'

/**
 * Delivery — CMS-editable delivery settings the public site reads to (a) show
 * the delivery trust messaging and (b) price the delivery fee at checkout.
 * A single global row; the public site reads it with the anon key.
 *
 * Two markets, each priced natively:
 *   - Kenya    — per-county distance base (KES) + size-tier + fragile add-ons.
 *   - Virginia — per-locality distance base (USD) + size-tier + fragile add-ons,
 *                mirroring the Kenya model on local Virginia courier rates
 *                (e.g. Lugg pickup base ~$54, van ~$90; GoShare ~$1.50-2.00/mi).
 *                Destinations outside Virginia are NOT auto-priced: the order is
 *                placed and shipping is quoted afterwards by staff.
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
    // =====================================================================
    // KENYA (KES)
    // =====================================================================
    {
      type: 'collapsible',
      label: 'Kenya delivery (KES)',
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
            Embu: 1100, 'Tharaka-Nithi': 1200, Meru: 1150, Kitui: 1200, Nakuru: 950,
            Narok: 1050, Bomet: 1250, Kericho: 1200, Nandi: 1400, 'Uasin Gishu': 1150,
            'Elgeyo-Marakwet': 1300, Baringo: 1300, 'Trans Nzoia': 1400, 'West Pokot': 1600,
            Samburu: 1800, Turkana: 2500, Kakamega: 1200, Vihiga: 1250, Bungoma: 1450,
            Busia: 1450, Siaya: 1350, Kisumu: 1250, 'Homa Bay': 1400, Migori: 1500,
            Kisii: 1250, Nyamira: 1300, Mombasa: 1500, Kwale: 1650, Kilifi: 1600,
            'Tana River': 1900, Lamu: 2000, 'Taita-Taveta': 1500, Garissa: 2000,
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
            description: 'Handling add-on per item size tier (KES), e.g. { "standard": 0, "medium": 400, "large": 800, "bulky": 1500 }.',
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
    },
    // =====================================================================
    // VIRGINIA / USA (USD)
    // =====================================================================
    {
      type: 'collapsible',
      label: 'Virginia delivery (USD)',
      fields: [
        {
          name: 'va_enabled',
          type: 'checkbox',
          label: 'Offer Virginia delivery',
          defaultValue: true,
        },
        {
          name: 'va_message',
          type: 'text',
          label: 'Trust badge text',
          defaultValue: 'Local delivery across Virginia',
          admin: { description: 'Short line shown on Virginia product cards, detail pages and checkout.' },
        },
        {
          name: 'va_details',
          type: 'textarea',
          label: 'Delivery & returns copy',
          admin: { description: 'Longer explanation shown on the Delivery section for the Virginia store.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'va_flat_fee',
              type: 'number',
              label: 'Base fee (locality)',
              defaultValue: 75,
              admin: { description: 'Default Virginia local base (USD) when no per-locality rate is set.' },
            },
            {
              name: 'va_free_above',
              type: 'number',
              label: 'Free delivery above',
              admin: { description: 'Order subtotal (USD) at/above which local delivery is free. Leave blank to disable.' },
            },
          ],
        },
        {
          name: 'va_outside_quote',
          type: 'checkbox',
          label: 'Quote shipping outside Virginia',
          defaultValue: true,
          admin: {
            description:
              'When ON, destinations outside Virginia are not auto-priced at checkout — the order is placed and staff quote shipping afterwards.',
          },
        },
        {
          name: 'va_locality_rates',
          type: 'json',
          label: 'Per-locality base rates',
          // USD local-delivery base by Virginia metro/locality, anchored at a
          // Richmond hub (~$55) and scaled by driving distance, in line with
          // local courier pricing (Lugg/GoShare furniture delivery + mileage).
          defaultValue: {
            Richmond: 55, Henrico: 55, Chesterfield: 60, Hanover: 60, Petersburg: 70,
            Williamsburg: 90, Fredericksburg: 90, Charlottesville: 95,
            'Newport News': 100, Hampton: 100, Suffolk: 110, Portsmouth: 115,
            Norfolk: 115, Manassas: 115, Chesapeake: 118, 'Virginia Beach': 120,
            Fairfax: 120, Alexandria: 120, 'Falls Church': 121, Staunton: 122,
            Arlington: 122, Lynchburg: 125, Leesburg: 135, Harrisonburg: 135,
            'Front Royal': 140, Lexington: 140, Danville: 145, Winchester: 150,
            Roanoke: 175, Blacksburg: 190,
          },
          admin: {
            description: 'Distance base per Virginia locality (USD). Falls back to the base fee. Tune any value freely.',
          },
        },
        {
          name: 'va_tier_surcharges',
          type: 'json',
          label: 'Size / weight surcharges',
          defaultValue: { standard: 0, medium: 25, large: 60, bulky: 120 },
          admin: {
            description: 'Handling add-on per item size tier (USD), e.g. { "standard": 0, "medium": 25, "large": 60, "bulky": 120 }.',
          },
        },
        {
          name: 'va_fragile_surcharge',
          type: 'number',
          label: 'Fragile surcharge',
          defaultValue: 35,
          admin: { description: 'Extra (USD) added when an item is marked fragile.' },
        },
      ],
    },
  ],
}
