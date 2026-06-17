-- Move the renamed *_legacy tables out of `public` into a `legacy` schema.
-- This also relocates their indexes/constraints, freeing the public namespace
-- so Payload can create its tables/indexes with the original names.
create schema if not exists legacy;

alter table if exists public.assets_legacy        set schema legacy;
alter table if exists public.asset_images_legacy  set schema legacy;
alter table if exists public.sale_events_legacy   set schema legacy;
alter table if exists public.services_legacy      set schema legacy;
alter table if exists public.testimonials_legacy  set schema legacy;
alter table if exists public.site_stats_legacy    set schema legacy;
alter table if exists public.inquiries_legacy     set schema legacy;
