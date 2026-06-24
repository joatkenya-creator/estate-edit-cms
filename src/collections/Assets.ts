import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/roles'
import { slugField } from '../fields/slug'
import { denormalizeAssetImages } from '../hooks/denormalizeAssetImages'
import {
  assetCategoryOptions,
  assetConditionOptions,
  assetStatusOptions,
  deliveryTierOptions,
  serviceDivisionOptions,
} from '../fields/options'

/**
 * Assets — the luxury + commercial catalogue (replaces the legacy `assets` +
 * `asset_images` tables). Field NAMES are intentionally snake_case so the
 * generated Postgres columns match exactly what the public Cloudflare site
 * already reads (Payload/Drizzle uses the field name verbatim as the column).
 *
 * Publish state is handled by Payload drafts (`_status`), replacing the old
 * `is_published` boolean. The public site filters `_status = 'published'`.
 */
export const Assets: CollectionConfig = {
  slug: 'assets',
  labels: { singular: 'Asset', plural: 'Assets' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'is_featured', '_status'],
    group: 'Content',
    listSearchableFields: ['title', 'brand', 'location'],
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 20,
  },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    beforeChange: [denormalizeAssetImages],
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
          name: 'division',
          type: 'select',
          required: true,
          defaultValue: 'estate_sales',
          options: serviceDivisionOptions,
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          defaultValue: 'other',
          options: assetCategoryOptions,
        },
      ],
    },
    {
      name: 'category_other',
      type: 'text',
      label: 'Custom category',
      admin: {
        // Only shown when "Other" is the selected category.
        condition: (data) => data?.category === 'other',
        description: 'Type the specific category — shown on the site instead of "Other".',
      },
      // Required only when the field is visible (category === 'other').
      validate: (value: string | null | undefined, { data }: { data: { category?: string } }) => {
        if (data?.category === 'other' && !value?.trim()) {
          return 'Please type the custom category.'
        }
        return true
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'available',
          options: assetStatusOptions,
          // Custom enum type name to avoid colliding with the drafts `_status`
          // enum (enum_assets_status). The COLUMN stays `status` for the site.
          enumName: 'enum_asset_availability',
        },
        {
          name: 'condition',
          type: 'select',
          options: assetConditionOptions,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'price', type: 'number', admin: { step: 1000 } },
        { name: 'currency', type: 'text', defaultValue: 'KES', admin: { width: '120px' } },
        {
          name: 'price_on_request',
          type: 'checkbox',
          label: 'Price on request',
          defaultValue: false,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Provenance & details',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'brand', type: 'text', label: 'Designer / Maker' },
            { name: 'era', type: 'text', label: 'Era / Year' },
          ],
        },
        { name: 'provenance', type: 'textarea' },
        {
          type: 'row',
          fields: [
            { name: 'dimensions', type: 'text' },
            { name: 'location', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'tags',
      type: 'json',
      admin: {
        description: 'Array of tag strings, e.g. ["mid-century", "teak"].',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Free-form JSON consumed by the site (e.g. { "meta": "...", "tone": "navy" }).',
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Gallery',
      labels: { singular: 'Image', plural: 'Images' },
      admin: {
        description:
          'Ordered gallery. Tick "Use as thumbnail" on one image to set the cover; otherwise the first image is used. A single image is automatically the thumbnail. Saving rebuilds the public image URLs.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            {
              name: 'is_cover',
              type: 'checkbox',
              label: 'Use as thumbnail',
              defaultValue: false,
              admin: { width: '160px' },
            },
          ],
        },
        { name: 'alt', type: 'text' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Delivery & handling',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'delivery_tier',
              type: 'select',
              defaultValue: 'standard',
              options: deliveryTierOptions,
              admin: { description: 'Size/weight band — adds a handling surcharge at checkout.' },
            },
            {
              name: 'fragile',
              type: 'checkbox',
              label: 'Fragile (extra care)',
              defaultValue: false,
              admin: { description: 'Adds the fragile surcharge.' },
            },
          ],
        },
      ],
    },
    // ----- Sidebar / denormalized + flags -----
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
    {
      name: 'primary_image_url',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-filled from the first gallery image.',
      },
    },
    {
      name: 'gallery',
      type: 'json',
      admin: {
        hidden: true,
        readOnly: true,
        description: 'Auto-built [{url, alt}] read by the public site.',
      },
    },
  ],
}
