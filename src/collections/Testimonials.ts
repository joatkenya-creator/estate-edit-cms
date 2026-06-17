import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/roles'
import { clientSegmentOptions } from '../fields/options'

/** Testimonials — client social proof. */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: {
    useAsTitle: 'author_name',
    defaultColumns: ['author_name', 'author_role', 'is_featured', '_status'],
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
        { name: 'author_name', type: 'text', required: true, label: 'Author name' },
        { name: 'author_role', type: 'text', label: 'Author role' },
      ],
    },
    { name: 'quote', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'client_segment',
          type: 'select',
          options: clientSegmentOptions,
        },
        { name: 'location', type: 'text' },
        {
          name: 'rating',
          type: 'number',
          min: 1,
          max: 5,
          admin: { width: '120px' },
        },
      ],
    },
    {
      name: 'avatar_url',
      type: 'text',
      admin: { description: 'Public image URL for the author avatar.' },
    },
    {
      name: 'is_featured',
      type: 'checkbox',
      label: 'Featured',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
