/**
 * One-time data migration: copy rows from the renamed `*_legacy` tables into
 * the new Payload-owned collections, via the Local API (so hooks + `_status`
 * run correctly). Idempotent-ish: skips a collection if it already has docs.
 *
 * Run AFTER the cutover SQL (which renames the existing tables to `*_legacy`
 * and lets `payload migrate` create the new tables). Then:
 *
 *   npm run migrate:legacy
 *
 * Reads the legacy tables through Payload's own Postgres pool — same DB, no
 * extra Supabase client needed.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

type Row = Record<string, unknown>
type Pool = { query: (sql: string, params?: unknown[]) => Promise<{ rows: Row[] }> }

const num = (v: unknown): number | undefined =>
  v === null || v === undefined ? undefined : Number(v)

const main = async () => {
  console.log('migrate-legacy: starting…')
  const payload = await getPayload({ config })
  const pool = (payload.db as unknown as { pool: Pool }).pool

  // Legacy data lives in the `legacy` schema (moved there during cutover).
  const tableExists = async (name: string): Promise<boolean> => {
    const { rows } = await pool.query(
      `select to_regclass($1) is not null as exists`,
      [`legacy.${name}`],
    )
    return Boolean(rows[0]?.exists)
  }

  const all = async (table: string, orderBy = 'created_at'): Promise<Row[]> => {
    if (!(await tableExists(table))) {
      console.warn(`Legacy table ${table} not found — skipping.`)
      return []
    }
    const { rows } = await pool.query(`select * from legacy.${table} order by ${orderBy} asc`)
    return rows
  }

  const countDocs = async (collection: string): Promise<number> => {
    const res = await payload.count({ collection: collection as never })
    return res.totalDocs
  }

  const statusFromPublished = (r: Row): 'published' | 'draft' =>
    r.is_published ? 'published' : 'draft'

  // ---- services ------------------------------------------------------------
  if ((await countDocs('services')) === 0) {
    for (const r of await all('services_legacy', 'sort_order')) {
      await payload.create({
        collection: 'services',
        overrideAccess: true,
        data: {
          slug: r.slug,
          division: r.division,
          title: r.title,
          summary: r.summary,
          description: r.description,
          icon: r.icon ?? 'estate',
          offerings: r.offerings ?? [],
          hero_image_url: r.hero_image_url,
          sort_order: num(r.sort_order) ?? 0,
          _status: statusFromPublished(r),
        } as never,
      })
    }
    console.log('Migrated services.')
  }

  // ---- site_stats ----------------------------------------------------------
  if ((await countDocs('site_stats')) === 0) {
    for (const r of await all('site_stats_legacy', 'sort_order')) {
      await payload.create({
        collection: 'site_stats',
        overrideAccess: true,
        data: {
          key: r.key,
          label: r.label,
          value: num(r.value) ?? 0,
          prefix: r.prefix,
          suffix: r.suffix,
          sort_order: num(r.sort_order) ?? 0,
          _status: statusFromPublished(r),
        } as never,
      })
    }
    console.log('Migrated site_stats.')
  }

  // ---- testimonials --------------------------------------------------------
  if ((await countDocs('testimonials')) === 0) {
    for (const r of await all('testimonials_legacy', 'sort_order')) {
      await payload.create({
        collection: 'testimonials',
        overrideAccess: true,
        data: {
          author_name: r.author_name,
          author_role: r.author_role,
          client_segment: r.client_segment,
          quote: r.quote,
          location: r.location,
          rating: num(r.rating),
          avatar_url: r.avatar_url,
          is_featured: Boolean(r.is_featured),
          sort_order: num(r.sort_order) ?? 0,
          _status: statusFromPublished(r),
        } as never,
      })
    }
    console.log('Migrated testimonials.')
  }

  // ---- sale_events ---------------------------------------------------------
  if ((await countDocs('sale_events')) === 0) {
    for (const r of await all('sale_events_legacy', 'starts_at')) {
      await payload.create({
        collection: 'sale_events',
        overrideAccess: true,
        data: {
          slug: r.slug,
          title: r.title,
          description: r.description,
          event_type: r.event_type,
          status: r.status,
          division: r.division,
          location: r.location,
          address: r.address,
          starts_at: r.starts_at,
          ends_at: r.ends_at,
          cover_image_url: r.cover_image_url,
          metadata: r.metadata ?? {},
          is_featured: Boolean(r.is_featured),
          _status: statusFromPublished(r),
        } as never,
      })
    }
    console.log('Migrated sale_events.')
  }

  // ---- assets (+ asset_images gallery) -------------------------------------
  if ((await countDocs('assets')) === 0) {
    const haveImages = await tableExists('asset_images_legacy')
    for (const r of await all('assets_legacy', 'sort_order')) {
      let gallery: { url: string; alt: string }[] = []
      if (haveImages) {
        const { rows: imgs } = await pool.query(
          `select url, alt from legacy.asset_images_legacy where asset_id = $1 order by sort_order asc`,
          [r.id],
        )
        gallery = imgs
          .filter((im) => im.url)
          .map((im) => ({ url: String(im.url), alt: String(im.alt ?? r.title ?? '') }))
      }
      const primary = (r.primary_image_url as string) ?? gallery[0]?.url ?? null

      await payload.create({
        collection: 'assets',
        overrideAccess: true,
        data: {
          slug: r.slug,
          title: r.title,
          description: r.description,
          division: r.division,
          category: r.category,
          status: r.status,
          condition: r.condition,
          price: num(r.price),
          currency: r.currency ?? 'KES',
          price_on_request: Boolean(r.price_on_request),
          brand: r.brand,
          era: r.era,
          provenance: r.provenance,
          dimensions: r.dimensions,
          location: r.location,
          tags: r.tags ?? [],
          metadata: r.metadata ?? {},
          is_featured: Boolean(r.is_featured),
          sort_order: num(r.sort_order) ?? 0,
          // Set denormalized image columns directly — the hook leaves them
          // alone because we don't supply an `images` array here.
          primary_image_url: primary,
          gallery,
          _status: statusFromPublished(r),
        } as never,
      })
    }
    console.log('Migrated assets (+ gallery).')
  }

  // ---- inquiries -----------------------------------------------------------
  if ((await countDocs('inquiries')) === 0) {
    for (const r of await all('inquiries_legacy', 'created_at')) {
      await payload.create({
        collection: 'inquiries',
        overrideAccess: true,
        data: {
          status: r.status ?? 'new',
          inquiry_type: r.inquiry_type ?? 'consultation',
          full_name: r.full_name,
          email: r.email,
          phone: r.phone,
          company: r.company,
          preferred_contact: r.preferred_contact,
          client_segment: r.client_segment,
          service_division: r.service_division,
          location: r.location,
          expat_direction: r.expat_direction,
          subject: r.subject,
          message: r.message,
          asset_category: r.asset_category,
          asset_description: r.asset_description,
          estimated_value: num(r.estimated_value),
          estimated_currency: r.estimated_currency ?? 'KES',
          consent: Boolean(r.consent),
          source: r.source,
          metadata: r.metadata ?? {},
        } as never,
      })
    }
    console.log('Migrated inquiries.')
  }

  for (const c of ['assets', 'services', 'site_stats', 'testimonials', 'sale_events', 'inquiries']) {
    const { rows } = await pool.query(`select count(*)::int as n from public.${c}`)
    console.log(`  public.${c}: ${rows[0].n}`)
  }
  console.log('Legacy migration complete.')
  process.exit(0)
}

// Top-level await keeps the event loop alive until the async work finishes —
// `payload run` otherwise exits as soon as the synchronous body returns.
await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
