import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/roles'

/** Site Stats — homepage "Why Estate Edit" metrics (count-up section). */
export const SiteStats: CollectionConfig = {
  slug: 'site_stats',
  labels: { singular: 'Site Stat', plural: 'Site Stats' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'value', 'suffix', 'sort_order', '_status'],
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
        {
          name: 'key',
          type: 'text',
          required: true,
          unique: true,
          admin: { description: "Stable key, e.g. 'assets_sold'." },
        },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'value', type: 'number', required: true },
        { name: 'prefix', type: 'text', admin: { width: '120px', description: "e.g. 'KES '" } },
        { name: 'suffix', type: 'text', admin: { width: '120px', description: "e.g. '+', 'B', '%'" } },
      ],
    },
    {
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
