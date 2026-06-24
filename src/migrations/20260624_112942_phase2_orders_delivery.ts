import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_payments_method" AS ENUM('pay_on_delivery', 'mpesa', 'cash', 'bank_transfer');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('unpaid', 'partial', 'paid');
  CREATE TABLE "orders_payments" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"amount" numeric NOT NULL,
  	"method" "enum_orders_payments_method" DEFAULT 'mpesa',
  	"paid_at" timestamp(3) with time zone,
  	"reference" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"order_number" varchar,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"full_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"county" varchar,
  	"town" varchar,
  	"address" varchar,
  	"delivery_notes" varchar,
  	"items" jsonb,
  	"subtotal" numeric DEFAULT 0,
  	"delivery_fee" numeric DEFAULT 0,
  	"total" numeric DEFAULT 0,
  	"currency" varchar DEFAULT 'KES',
  	"payment_status" "enum_orders_payment_status" DEFAULT 'unpaid',
  	"amount_paid" numeric DEFAULT 0,
  	"paid_at" timestamp(3) with time zone,
  	"source" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "delivery" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"message" varchar DEFAULT 'We deliver countrywide',
  	"details" varchar,
  	"flat_fee" numeric DEFAULT 0,
  	"free_above" numeric,
  	"county_rates" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" uuid;
  ALTER TABLE "orders_payments" ADD CONSTRAINT "orders_payments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_payments_order_idx" ON "orders_payments" USING btree ("_order");
  CREATE INDEX "orders_payments_parent_id_idx" ON "orders_payments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_payments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "delivery" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders_payments" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "delivery" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  DROP TYPE "public"."enum_orders_payments_method";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_status";`)
}
