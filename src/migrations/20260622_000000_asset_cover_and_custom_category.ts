import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Additive, non-destructive migration:
 *   - assets.category_other / _assets_v.version_category_other
 *       free-text label typed when category = 'other'.
 *   - assets_images.is_cover / _assets_v_version_images.is_cover
 *       per-image "use as thumbnail" flag honoured by denormalizeAssetImages.
 *
 * IF [NOT] EXISTS guards keep this safe to re-run against the shared Supabase DB.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "category_other" varchar;
    ALTER TABLE "_assets_v" ADD COLUMN IF NOT EXISTS "version_category_other" varchar;
    ALTER TABLE "assets_images" ADD COLUMN IF NOT EXISTS "is_cover" boolean DEFAULT false;
    ALTER TABLE "_assets_v_version_images" ADD COLUMN IF NOT EXISTS "is_cover" boolean DEFAULT false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "assets" DROP COLUMN IF EXISTS "category_other";
    ALTER TABLE "_assets_v" DROP COLUMN IF EXISTS "version_category_other";
    ALTER TABLE "assets_images" DROP COLUMN IF EXISTS "is_cover";
    ALTER TABLE "_assets_v_version_images" DROP COLUMN IF EXISTS "is_cover";
  `)
}
