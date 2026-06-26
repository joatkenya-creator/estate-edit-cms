import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_assets_market" AS ENUM('kenya', 'virginia');
  CREATE TYPE "public"."enum__assets_v_version_market" AS ENUM('kenya', 'virginia');
  CREATE TYPE "public"."enum_orders_market" AS ENUM('kenya', 'virginia');
  ALTER TYPE "public"."enum_orders_status" ADD VALUE 'returned' BEFORE 'cancelled';
  ALTER TABLE "delivery" ALTER COLUMN "county_rates" SET DEFAULT '{"Nairobi":800,"Kiambu":950,"Kajiado":950,"Machakos":1050,"Makueni":1150,"Murang''a":950,"Kirinyaga":1050,"Nyandarua":1050,"Nyeri":1100,"Laikipia":1300,"Embu":1100,"Tharaka-Nithi":1200,"Meru":1150,"Kitui":1200,"Nakuru":950,"Narok":1050,"Bomet":1250,"Kericho":1200,"Nandi":1400,"Uasin Gishu":1150,"Elgeyo-Marakwet":1300,"Baringo":1300,"Trans Nzoia":1400,"West Pokot":1600,"Samburu":1800,"Turkana":2500,"Kakamega":1200,"Vihiga":1250,"Bungoma":1450,"Busia":1450,"Siaya":1350,"Kisumu":1250,"Homa Bay":1400,"Migori":1500,"Kisii":1250,"Nyamira":1300,"Mombasa":1500,"Kwale":1650,"Kilifi":1600,"Tana River":1900,"Lamu":2000,"Taita-Taveta":1500,"Garissa":2000,"Wajir":2500,"Mandera":2800,"Marsabit":2300,"Isiolo":1500}'::jsonb;
  ALTER TABLE "assets" ADD COLUMN "market" "enum_assets_market" DEFAULT 'kenya';
  ALTER TABLE "_assets_v" ADD COLUMN "version_market" "enum__assets_v_version_market" DEFAULT 'kenya';
  ALTER TABLE "orders" ADD COLUMN "state" varchar;
  ALTER TABLE "orders" ADD COLUMN "postal_code" varchar;
  ALTER TABLE "orders" ADD COLUMN "country" varchar;
  ALTER TABLE "orders" ADD COLUMN "delivery_quote_pending" boolean DEFAULT false;
  ALTER TABLE "orders" ADD COLUMN "market" "enum_orders_market" DEFAULT 'kenya';
  ALTER TABLE "delivery" ADD COLUMN "va_enabled" boolean DEFAULT true;
  ALTER TABLE "delivery" ADD COLUMN "va_message" varchar DEFAULT 'Local delivery across Virginia';
  ALTER TABLE "delivery" ADD COLUMN "va_details" varchar;
  ALTER TABLE "delivery" ADD COLUMN "va_flat_fee" numeric DEFAULT 75;
  ALTER TABLE "delivery" ADD COLUMN "va_free_above" numeric;
  ALTER TABLE "delivery" ADD COLUMN "va_outside_quote" boolean DEFAULT true;
  ALTER TABLE "delivery" ADD COLUMN "va_locality_rates" jsonb DEFAULT '{"Richmond":55,"Henrico":55,"Chesterfield":60,"Hanover":60,"Petersburg":70,"Williamsburg":90,"Fredericksburg":90,"Charlottesville":95,"Newport News":100,"Hampton":100,"Suffolk":110,"Portsmouth":115,"Norfolk":115,"Manassas":115,"Chesapeake":118,"Virginia Beach":120,"Fairfax":120,"Alexandria":120,"Falls Church":121,"Staunton":122,"Arlington":122,"Lynchburg":125,"Leesburg":135,"Harrisonburg":135,"Front Royal":140,"Lexington":140,"Danville":145,"Winchester":150,"Roanoke":175,"Blacksburg":190}'::jsonb;
  ALTER TABLE "delivery" ADD COLUMN "va_tier_surcharges" jsonb DEFAULT '{"standard":0,"medium":25,"large":60,"bulky":120}'::jsonb;
  ALTER TABLE "delivery" ADD COLUMN "va_fragile_surcharge" numeric DEFAULT 35;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  ALTER TABLE "delivery" ALTER COLUMN "county_rates" SET DEFAULT '{"Nairobi":800}'::jsonb;
  ALTER TABLE "assets" DROP COLUMN "market";
  ALTER TABLE "_assets_v" DROP COLUMN "version_market";
  ALTER TABLE "orders" DROP COLUMN "state";
  ALTER TABLE "orders" DROP COLUMN "postal_code";
  ALTER TABLE "orders" DROP COLUMN "country";
  ALTER TABLE "orders" DROP COLUMN "delivery_quote_pending";
  ALTER TABLE "orders" DROP COLUMN "market";
  ALTER TABLE "delivery" DROP COLUMN "va_enabled";
  ALTER TABLE "delivery" DROP COLUMN "va_message";
  ALTER TABLE "delivery" DROP COLUMN "va_details";
  ALTER TABLE "delivery" DROP COLUMN "va_flat_fee";
  ALTER TABLE "delivery" DROP COLUMN "va_free_above";
  ALTER TABLE "delivery" DROP COLUMN "va_outside_quote";
  ALTER TABLE "delivery" DROP COLUMN "va_locality_rates";
  ALTER TABLE "delivery" DROP COLUMN "va_tier_surcharges";
  ALTER TABLE "delivery" DROP COLUMN "va_fragile_surcharge";
  DROP TYPE "public"."enum_assets_market";
  DROP TYPE "public"."enum__assets_v_version_market";
  DROP TYPE "public"."enum_orders_market";`)
}
