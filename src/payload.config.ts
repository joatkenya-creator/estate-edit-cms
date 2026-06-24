import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Assets } from './collections/Assets'
import { SaleEvents } from './collections/SaleEvents'
import { Services } from './collections/Services'
import { Testimonials } from './collections/Testimonials'
import { SiteStats } from './collections/SiteStats'
import { Inquiries } from './collections/Inquiries'
import { Orders } from './collections/Orders'
import { Delivery } from './globals/Delivery'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const allowedOrigins = (process.env.PAYLOAD_PUBLIC_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const mediaPrefix = process.env.SUPABASE_MEDIA_PREFIX ?? 'media'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— The Estate Edit',
    },
  },
  collections: [
    // Content (drafts on)
    Assets,
    SaleEvents,
    Services,
    Testimonials,
    SiteStats,
    // Leads + sales
    Inquiries,
    Orders,
    // Library + auth
    Media,
    Users,
  ],
  globals: [Delivery],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // CORS/CSRF: the public marketing site (Cloudflare) + this CMS origin.
  cors: allowedOrigins,
  csrf: allowedOrigins,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    // Matches the UUID primary-key convention of the existing Supabase schema.
    idType: 'uuid',
    // Use migrations, NOT dev auto-push. Push would try to "reconcile" the
    // shared DB (e.g. drop the legacy enums still in `public`) and fail/destroy.
    push: false,
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        // Store uploaded media under the `media/` prefix of the public bucket.
        // (The plugin disables local disk storage for configured collections.)
        media: {
          prefix: mediaPrefix,
        },
      },
      bucket: process.env.SUPABASE_S3_BUCKET || 'asset-images',
      config: {
        endpoint: process.env.SUPABASE_S3_ENDPOINT,
        region: process.env.SUPABASE_S3_REGION,
        // Supabase S3 requires path-style addressing.
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
