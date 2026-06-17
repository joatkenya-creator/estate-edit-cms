import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/roles'

/**
 * Media library. Files are stored in Supabase Storage (S3-compatible) via the
 * s3Storage plugin configured in payload.config.ts — see SUPABASE_S3_* env.
 *
 * The public site does NOT read this collection directly; instead the Assets
 * hook denormalizes the resolved public CDN URLs onto each asset row
 * (primary_image_url + gallery) so the Cloudflare site keeps single-column reads.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Library',
  },
  access: {
    // Media files live in a public Supabase bucket; allow public read metadata
    // so denormalized URLs resolve, but only CMS users can upload/change.
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    // Auto-generated, auto-resized variants (created by sharp on upload).
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
      { name: 'hero', width: 1920, height: undefined, position: 'centre' },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt text',
      admin: {
        description: 'Describe the image for accessibility and SEO.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: {
        description: 'Optional photographer / source credit.',
      },
    },
  ],
}
