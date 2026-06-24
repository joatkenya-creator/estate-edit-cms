import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_assets_delivery_tier" AS ENUM('standard', 'medium', 'large', 'bulky');
  CREATE TYPE "public"."enum__assets_v_version_delivery_tier" AS ENUM('standard', 'medium', 'large', 'bulky');
  ALTER TABLE "delivery" ALTER COLUMN "flat_fee" SET DEFAULT 800;
  ALTER TABLE "delivery" ALTER COLUMN "county_rates" SET DEFAULT '{"Nairobi":800}'::jsonb;
  ALTER TABLE "assets" ADD COLUMN "delivery_tier" "enum_assets_delivery_tier" DEFAULT 'standard';
  ALTER TABLE "assets" ADD COLUMN "fragile" boolean DEFAULT false;
  ALTER TABLE "_assets_v" ADD COLUMN "version_delivery_tier" "enum__assets_v_version_delivery_tier" DEFAULT 'standard';
  ALTER TABLE "_assets_v" ADD COLUMN "version_fragile" boolean DEFAULT false;
  ALTER TABLE "delivery" ADD COLUMN "tier_surcharges" jsonb DEFAULT '{"standard":0,"medium":400,"large":800,"bulky":1500}'::jsonb;
  ALTER TABLE "delivery" ADD COLUMN "fragile_surcharge" numeric DEFAULT 500;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "delivery" ALTER COLUMN "flat_fee" SET DEFAULT 0;
  ALTER TABLE "delivery" ALTER COLUMN "county_rates" DROP DEFAULT;
  ALTER TABLE "assets" DROP COLUMN "delivery_tier";
  ALTER TABLE "assets" DROP COLUMN "fragile";
  ALTER TABLE "_assets_v" DROP COLUMN "version_delivery_tier";
  ALTER TABLE "_assets_v" DROP COLUMN "version_fragile";
  ALTER TABLE "delivery" DROP COLUMN "tier_surcharges";
  ALTER TABLE "delivery" DROP COLUMN "fragile_surcharge";
  DROP TYPE "public"."enum_assets_delivery_tier";
  DROP TYPE "public"."enum__assets_v_version_delivery_tier";`)
}
