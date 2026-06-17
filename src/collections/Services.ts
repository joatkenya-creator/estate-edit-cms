import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/roles'
import { slugField } from '../fields/slug'
import { serviceDivisionOptions } from '../fields/options'

/** Services — the service divisions that drive the service pages. */
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'division', 'sort_order', '_status'],
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
    {
      name: 'division',
      type: 'select',
      required: true,
      defaultValue: 'estate_sales',
      options: serviceDivisionOptions,
    },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'textarea' },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'estate',
      options: [
        { label: 'Estate', value: 'estate' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Concierge', value: 'concierge' },
      ],
      admin: { description: 'Icon key used by the site UI.' },
    },
    {
      name: 'offerings',
      type: 'json',
      admin: { description: 'Array of bullet strings, e.g. ["Inventory & cataloguing", ...].' },
    },
    {
      name: 'hero_image_url',
      type: 'text',
      admin: { description: 'Public image URL for the service hero.' },
    },
    {
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
