import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/roles'
import { slugField } from '../fields/slug'
import { eventStatusOptions, eventTypeOptions, serviceDivisionOptions } from '../fields/options'

/** Sale Events — estate sales, online auctions & liquidation events. */
export const SaleEvents: CollectionConfig = {
  slug: 'sale_events',
  labels: { singular: 'Sale Event', plural: 'Sale Events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'event_type', 'status', 'starts_at', '_status'],
    group: 'Content',
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true },
        slugField('title'),
      ],
    },
    { name: 'description', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'event_type',
          type: 'select',
          required: true,
          defaultValue: 'estate_sale',
          options: eventTypeOptions,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'upcoming',
          options: eventStatusOptions,
          // Distinct enum type name so it doesn't collide with the drafts
          // `_status` enum (enum_sale_events_status). Column stays `status`.
          enumName: 'enum_sale_event_lifecycle',
        },
        {
          name: 'division',
          type: 'select',
          required: true,
          defaultValue: 'estate_sales',
          options: serviceDivisionOptions,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'location', type: 'text', admin: { description: 'Neighbourhood / city' } },
        { name: 'address', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'starts_at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'ends_at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      name: 'cover_image_url',
      type: 'text',
      admin: { description: 'Public image URL for the event cover.' },
    },
    { name: 'metadata', type: 'json' },
    {
      name: 'is_featured',
      type: 'checkbox',
      label: 'Featured',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
