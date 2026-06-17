import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_assets_division" AS ENUM('estate_sales', 'commercial_liquidation', 'concierge', 'expat_services');
  CREATE TYPE "public"."enum_assets_category" AS ENUM('furniture', 'fine_art', 'jewelry', 'vehicles', 'collectibles', 'designer', 'lighting', 'rugs', 'antiques', 'equipment', 'fleet', 'inventory', 'office', 'other');
  CREATE TYPE "public"."enum_asset_availability" AS ENUM('available', 'reserved', 'pending', 'sold', 'withdrawn');
  CREATE TYPE "public"."enum_assets_condition" AS ENUM('new', 'excellent', 'very_good', 'good', 'fair');
  CREATE TYPE "public"."enum_assets_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__assets_v_version_division" AS ENUM('estate_sales', 'commercial_liquidation', 'concierge', 'expat_services');
  CREATE TYPE "public"."enum__assets_v_version_category" AS ENUM('furniture', 'fine_art', 'jewelry', 'vehicles', 'collectibles', 'designer', 'lighting', 'rugs', 'antiques', 'equipment', 'fleet', 'inventory', 'office', 'other');
  CREATE TYPE "public"."enum__assets_v_version_condition" AS ENUM('new', 'excellent', 'very_good', 'good', 'fair');
  CREATE TYPE "public"."enum__assets_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sale_events_event_type" AS ENUM('estate_sale', 'online_auction', 'liquidation', 'private_event');
  CREATE TYPE "public"."enum_sale_event_lifecycle" AS ENUM('upcoming', 'live', 'ended', 'cancelled');
  CREATE TYPE "public"."enum_sale_events_division" AS ENUM('estate_sales', 'commercial_liquidation', 'concierge', 'expat_services');
  CREATE TYPE "public"."enum_sale_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sale_events_v_version_event_type" AS ENUM('estate_sale', 'online_auction', 'liquidation', 'private_event');
  CREATE TYPE "public"."enum__sale_events_v_version_division" AS ENUM('estate_sales', 'commercial_liquidation', 'concierge', 'expat_services');
  CREATE TYPE "public"."enum__sale_events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_services_division" AS ENUM('estate_sales', 'commercial_liquidation', 'concierge', 'expat_services');
  CREATE TYPE "public"."enum_services_icon" AS ENUM('estate', 'commercial', 'concierge');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_division" AS ENUM('estate_sales', 'commercial_liquidation', 'concierge', 'expat_services');
  CREATE TYPE "public"."enum__services_v_version_icon" AS ENUM('estate', 'commercial', 'concierge');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_testimonials_client_segment" AS ENUM('individual', 'family', 'estate_executor', 'business_owner', 'expat', 'embassy', 'corporation');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_client_segment" AS ENUM('individual', 'family', 'estate_executor', 'business_owner', 'expat', 'embassy', 'corporation');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_stats_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_stats_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'contacted', 'qualified', 'won', 'lost', 'archived');
  CREATE TYPE "public"."enum_inquiries_inquiry_type" AS ENUM('consultation', 'asset_review');
  CREATE TYPE "public"."enum_inquiries_client_segment" AS ENUM('individual', 'family', 'estate_executor', 'business_owner', 'expat', 'embassy', 'corporation');
  CREATE TYPE "public"."enum_inquiries_service_division" AS ENUM('estate_sales', 'commercial_liquidation', 'concierge', 'expat_services');
  CREATE TYPE "public"."enum_inquiries_asset_category" AS ENUM('furniture', 'fine_art', 'jewelry', 'vehicles', 'collectibles', 'designer', 'lighting', 'rugs', 'antiques', 'equipment', 'fleet', 'inventory', 'office', 'other');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "assets_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" uuid,
  	"alt" varchar
  );
  
  CREATE TABLE "assets" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"division" "enum_assets_division" DEFAULT 'estate_sales',
  	"category" "enum_assets_category" DEFAULT 'other',
  	"status" "enum_asset_availability" DEFAULT 'available',
  	"condition" "enum_assets_condition",
  	"price" numeric,
  	"currency" varchar DEFAULT 'KES',
  	"price_on_request" boolean DEFAULT false,
  	"brand" varchar,
  	"era" varchar,
  	"provenance" varchar,
  	"dimensions" varchar,
  	"location" varchar,
  	"tags" jsonb,
  	"metadata" jsonb,
  	"is_featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"primary_image_url" varchar,
  	"gallery" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_assets_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_assets_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"image_id" uuid,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_assets_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_division" "enum__assets_v_version_division" DEFAULT 'estate_sales',
  	"version_category" "enum__assets_v_version_category" DEFAULT 'other',
  	"version_status" "enum_asset_availability" DEFAULT 'available',
  	"version_condition" "enum__assets_v_version_condition",
  	"version_price" numeric,
  	"version_currency" varchar DEFAULT 'KES',
  	"version_price_on_request" boolean DEFAULT false,
  	"version_brand" varchar,
  	"version_era" varchar,
  	"version_provenance" varchar,
  	"version_dimensions" varchar,
  	"version_location" varchar,
  	"version_tags" jsonb,
  	"version_metadata" jsonb,
  	"version_is_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_primary_image_url" varchar,
  	"version_gallery" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__assets_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "sale_events" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"event_type" "enum_sale_events_event_type" DEFAULT 'estate_sale',
  	"status" "enum_sale_event_lifecycle" DEFAULT 'upcoming',
  	"division" "enum_sale_events_division" DEFAULT 'estate_sales',
  	"location" varchar,
  	"address" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"cover_image_url" varchar,
  	"metadata" jsonb,
  	"is_featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_sale_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_sale_events_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_event_type" "enum__sale_events_v_version_event_type" DEFAULT 'estate_sale',
  	"version_status" "enum_sale_event_lifecycle" DEFAULT 'upcoming',
  	"version_division" "enum__sale_events_v_version_division" DEFAULT 'estate_sales',
  	"version_location" varchar,
  	"version_address" varchar,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_cover_image_url" varchar,
  	"version_metadata" jsonb,
  	"version_is_featured" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__sale_events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "services" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"division" "enum_services_division" DEFAULT 'estate_sales',
  	"summary" varchar,
  	"description" varchar,
  	"icon" "enum_services_icon" DEFAULT 'estate',
  	"offerings" jsonb,
  	"hero_image_url" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_services_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_division" "enum__services_v_version_division" DEFAULT 'estate_sales',
  	"version_summary" varchar,
  	"version_description" varchar,
  	"version_icon" "enum__services_v_version_icon" DEFAULT 'estate',
  	"version_offerings" jsonb,
  	"version_hero_image_url" varchar,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "testimonials" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"author_name" varchar,
  	"author_role" varchar,
  	"quote" varchar,
  	"client_segment" "enum_testimonials_client_segment",
  	"location" varchar,
  	"rating" numeric,
  	"avatar_url" varchar,
  	"is_featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_author_name" varchar,
  	"version_author_role" varchar,
  	"version_quote" varchar,
  	"version_client_segment" "enum__testimonials_v_version_client_segment",
  	"version_location" varchar,
  	"version_rating" numeric,
  	"version_avatar_url" varchar,
  	"version_is_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "site_stats" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"value" numeric,
  	"prefix" varchar,
  	"suffix" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_site_stats_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_site_stats_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_key" varchar,
  	"version_label" varchar,
  	"version_value" numeric,
  	"version_prefix" varchar,
  	"version_suffix" varchar,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__site_stats_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "inquiries" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"status" "enum_inquiries_status" DEFAULT 'new' NOT NULL,
  	"inquiry_type" "enum_inquiries_inquiry_type" DEFAULT 'consultation' NOT NULL,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"company" varchar,
  	"preferred_contact" varchar,
  	"client_segment" "enum_inquiries_client_segment",
  	"service_division" "enum_inquiries_service_division",
  	"location" varchar,
  	"expat_direction" varchar,
  	"subject" varchar,
  	"message" varchar,
  	"asset_category" "enum_inquiries_asset_category",
  	"asset_description" varchar,
  	"estimated_value" numeric,
  	"estimated_currency" varchar DEFAULT 'KES',
  	"consent" boolean DEFAULT false,
  	"source" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"alt" varchar,
  	"credit" varchar,
  	"prefix" varchar DEFAULT 'media',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"assets_id" uuid,
  	"sale_events_id" uuid,
  	"services_id" uuid,
  	"testimonials_id" uuid,
  	"site_stats_id" uuid,
  	"inquiries_id" uuid,
  	"media_id" uuid,
  	"users_id" uuid
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" uuid
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "assets_images" ADD CONSTRAINT "assets_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "assets_images" ADD CONSTRAINT "assets_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_assets_v_version_images" ADD CONSTRAINT "_assets_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_assets_v_version_images" ADD CONSTRAINT "_assets_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_assets_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_assets_v" ADD CONSTRAINT "_assets_v_parent_id_assets_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sale_events_v" ADD CONSTRAINT "_sale_events_v_parent_id_sale_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sale_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_stats_v" ADD CONSTRAINT "_site_stats_v_parent_id_site_stats_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_stats"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_assets_fk" FOREIGN KEY ("assets_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sale_events_fk" FOREIGN KEY ("sale_events_id") REFERENCES "public"."sale_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_stats_fk" FOREIGN KEY ("site_stats_id") REFERENCES "public"."site_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "assets_images_order_idx" ON "assets_images" USING btree ("_order");
  CREATE INDEX "assets_images_parent_id_idx" ON "assets_images" USING btree ("_parent_id");
  CREATE INDEX "assets_images_image_idx" ON "assets_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "assets_slug_idx" ON "assets" USING btree ("slug");
  CREATE INDEX "assets_updated_at_idx" ON "assets" USING btree ("updated_at");
  CREATE INDEX "assets_created_at_idx" ON "assets" USING btree ("created_at");
  CREATE INDEX "assets__status_idx" ON "assets" USING btree ("_status");
  CREATE INDEX "_assets_v_version_images_order_idx" ON "_assets_v_version_images" USING btree ("_order");
  CREATE INDEX "_assets_v_version_images_parent_id_idx" ON "_assets_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_assets_v_version_images_image_idx" ON "_assets_v_version_images" USING btree ("image_id");
  CREATE INDEX "_assets_v_parent_idx" ON "_assets_v" USING btree ("parent_id");
  CREATE INDEX "_assets_v_version_version_slug_idx" ON "_assets_v" USING btree ("version_slug");
  CREATE INDEX "_assets_v_version_version_updated_at_idx" ON "_assets_v" USING btree ("version_updated_at");
  CREATE INDEX "_assets_v_version_version_created_at_idx" ON "_assets_v" USING btree ("version_created_at");
  CREATE INDEX "_assets_v_version_version__status_idx" ON "_assets_v" USING btree ("version__status");
  CREATE INDEX "_assets_v_created_at_idx" ON "_assets_v" USING btree ("created_at");
  CREATE INDEX "_assets_v_updated_at_idx" ON "_assets_v" USING btree ("updated_at");
  CREATE INDEX "_assets_v_latest_idx" ON "_assets_v" USING btree ("latest");
  CREATE UNIQUE INDEX "sale_events_slug_idx" ON "sale_events" USING btree ("slug");
  CREATE INDEX "sale_events_updated_at_idx" ON "sale_events" USING btree ("updated_at");
  CREATE INDEX "sale_events_created_at_idx" ON "sale_events" USING btree ("created_at");
  CREATE INDEX "sale_events__status_idx" ON "sale_events" USING btree ("_status");
  CREATE INDEX "_sale_events_v_parent_idx" ON "_sale_events_v" USING btree ("parent_id");
  CREATE INDEX "_sale_events_v_version_version_slug_idx" ON "_sale_events_v" USING btree ("version_slug");
  CREATE INDEX "_sale_events_v_version_version_updated_at_idx" ON "_sale_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_sale_events_v_version_version_created_at_idx" ON "_sale_events_v" USING btree ("version_created_at");
  CREATE INDEX "_sale_events_v_version_version__status_idx" ON "_sale_events_v" USING btree ("version__status");
  CREATE INDEX "_sale_events_v_created_at_idx" ON "_sale_events_v" USING btree ("created_at");
  CREATE INDEX "_sale_events_v_updated_at_idx" ON "_sale_events_v" USING btree ("updated_at");
  CREATE INDEX "_sale_events_v_latest_idx" ON "_sale_events_v" USING btree ("latest");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE UNIQUE INDEX "site_stats_key_idx" ON "site_stats" USING btree ("key");
  CREATE INDEX "site_stats_updated_at_idx" ON "site_stats" USING btree ("updated_at");
  CREATE INDEX "site_stats_created_at_idx" ON "site_stats" USING btree ("created_at");
  CREATE INDEX "site_stats__status_idx" ON "site_stats" USING btree ("_status");
  CREATE INDEX "_site_stats_v_parent_idx" ON "_site_stats_v" USING btree ("parent_id");
  CREATE INDEX "_site_stats_v_version_version_key_idx" ON "_site_stats_v" USING btree ("version_key");
  CREATE INDEX "_site_stats_v_version_version_updated_at_idx" ON "_site_stats_v" USING btree ("version_updated_at");
  CREATE INDEX "_site_stats_v_version_version_created_at_idx" ON "_site_stats_v" USING btree ("version_created_at");
  CREATE INDEX "_site_stats_v_version_version__status_idx" ON "_site_stats_v" USING btree ("version__status");
  CREATE INDEX "_site_stats_v_created_at_idx" ON "_site_stats_v" USING btree ("created_at");
  CREATE INDEX "_site_stats_v_updated_at_idx" ON "_site_stats_v" USING btree ("updated_at");
  CREATE INDEX "_site_stats_v_latest_idx" ON "_site_stats_v" USING btree ("latest");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_assets_id_idx" ON "payload_locked_documents_rels" USING btree ("assets_id");
  CREATE INDEX "payload_locked_documents_rels_sale_events_id_idx" ON "payload_locked_documents_rels" USING btree ("sale_events_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_site_stats_id_idx" ON "payload_locked_documents_rels" USING btree ("site_stats_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "assets_images" CASCADE;
  DROP TABLE "assets" CASCADE;
  DROP TABLE "_assets_v_version_images" CASCADE;
  DROP TABLE "_assets_v" CASCADE;
  DROP TABLE "sale_events" CASCADE;
  DROP TABLE "_sale_events_v" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "site_stats" CASCADE;
  DROP TABLE "_site_stats_v" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_assets_division";
  DROP TYPE "public"."enum_assets_category";
  DROP TYPE "public"."enum_asset_availability";
  DROP TYPE "public"."enum_assets_condition";
  DROP TYPE "public"."enum_assets_status";
  DROP TYPE "public"."enum__assets_v_version_division";
  DROP TYPE "public"."enum__assets_v_version_category";
  DROP TYPE "public"."enum__assets_v_version_condition";
  DROP TYPE "public"."enum__assets_v_version_status";
  DROP TYPE "public"."enum_sale_events_event_type";
  DROP TYPE "public"."enum_sale_event_lifecycle";
  DROP TYPE "public"."enum_sale_events_division";
  DROP TYPE "public"."enum_sale_events_status";
  DROP TYPE "public"."enum__sale_events_v_version_event_type";
  DROP TYPE "public"."enum__sale_events_v_version_division";
  DROP TYPE "public"."enum__sale_events_v_version_status";
  DROP TYPE "public"."enum_services_division";
  DROP TYPE "public"."enum_services_icon";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_division";
  DROP TYPE "public"."enum__services_v_version_icon";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum_testimonials_client_segment";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_client_segment";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum_site_stats_status";
  DROP TYPE "public"."enum__site_stats_v_version_status";
  DROP TYPE "public"."enum_inquiries_status";
  DROP TYPE "public"."enum_inquiries_inquiry_type";
  DROP TYPE "public"."enum_inquiries_client_segment";
  DROP TYPE "public"."enum_inquiries_service_division";
  DROP TYPE "public"."enum_inquiries_asset_category";
  DROP TYPE "public"."enum_users_role";`)
}
