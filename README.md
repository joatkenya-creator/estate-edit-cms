# The Estate Edit — CMS (Payload)

Admin + content layer for The Estate Edit. This is a **separate Next.js app**
(Payload 3) deployed to **Vercel**, pointed at the **same Supabase Postgres** the
public marketing site uses. The public site stays on Cloudflare Workers and keeps
reading Supabase directly — this app is where staff manage content.

- **Admin panel:** `/admin`
- **REST API:** `/api/...` · **GraphQL:** `/api/graphql`
- **DB:** Supabase Postgres (Payload owns the schema; connects via the pooler as
  the privileged `postgres` role, so it bypasses RLS).
- **Media:** Supabase Storage (S3-compatible), public `asset-images` bucket.

## Collections

| Collection | Purpose |
|---|---|
| Assets | Luxury + commercial catalogue. Drafts on. Gallery via the Media library; cover + gallery URLs are denormalized onto the row (`primary_image_url`, `gallery`) for the public site. |
| Sale Events / Services / Testimonials / Site Stats | Site content. Drafts on. |
| Inquiries | **Leads inbox / CRM.** Rows are created by the public site (Supabase insert); staff triage status `new → contacted → won/lost`. No drafts. |
| Media | Upload library → Supabase Storage, auto-resized variants. |
| Users | Auth. Roles: `admin` (everything, incl. users) and `editor` (content + inquiries). |

## Prerequisites

- Node ≥ 20.9
- The shared Supabase project (`czvrsproxqlpcnvbaltq`): a pooler connection string
  and S3 access keys (Supabase → Storage → S3 connection).

## Local development

```bash
cd estate-edit-cms
cp .env.example .env        # then fill in real values
npm install
npm run generate:importmap  # build the admin component import map
npm run dev                 # http://localhost:3000 → redirects to /admin
```

On first run, create the initial **admin** user at `/admin` (set role = Admin).

### Environment variables

See [`.env.example`](./.env.example). Summary:

| Var | What |
|---|---|
| `PAYLOAD_SECRET` | Long random string (`openssl rand -base64 32`). |
| `PAYLOAD_PUBLIC_SERVER_URL` | This app's URL (local: `http://localhost:3000`). |
| `PAYLOAD_PUBLIC_ALLOWED_ORIGINS` | Comma list for CORS/CSRF (CMS + public site). |
| `DATABASE_URI` | Supabase **pooler** URI (transaction pooler / port 6543 for Vercel). |
| `SUPABASE_S3_ENDPOINT` | `https://<ref>.storage.supabase.co/storage/v1/s3` |
| `SUPABASE_S3_REGION` | Supabase project region (e.g. `eu-central-1`). |
| `SUPABASE_S3_ACCESS_KEY_ID` / `SUPABASE_S3_SECRET_ACCESS_KEY` | Supabase S3 keys. |
| `SUPABASE_S3_BUCKET` | `asset-images` (reuses the site's existing public bucket). |
| `SUPABASE_PUBLIC_URL` | `https://<ref>.supabase.co` — used to build public CDN links. |

## One-time database cutover

Payload owns the schema, so the existing tables are moved aside and the data is
copied in. Full ordered runbook (with backup + verification):
[`../estate-edit/supabase/payload-cutover/README.md`](../estate-edit/supabase/payload-cutover/README.md).

Short version:

```bash
# 1. (Supabase SQL editor) rename existing tables → *_legacy
#    estate-edit/supabase/payload-cutover/01_rename_legacy.sql
npm run migrate          # 2. Payload creates its own tables
npm run migrate:legacy   # 3. copy *_legacy rows in via the Local API
# 4. (Supabase SQL editor) re-establish RLS the public site needs
#    estate-edit/supabase/payload-cutover/02_payload_rls_and_grants.sql
```

> **Do this against a Supabase branch/staging project first if possible.**

After cutover, regenerate the public site's DB types and only THEN redeploy it:

```bash
cd ../estate-edit
npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

The public site changes ([`queries.ts`](../estate-edit/src/lib/queries.ts),
[`inquiry.ts`](../estate-edit/src/app/actions/inquiry.ts)) target the NEW schema —
**don't redeploy the Cloudflare site until the cutover is done.**

## Deploy to Vercel

This requires logging into **your** Vercel account (it can't be done for you).
Two paths — pick one.

### A) Dashboard (no CLI)

1. Push this repo to GitHub (the CMS lives in the `estate-edit-cms/` folder).
2. Vercel → **Add New… → Project** → import the repo.
3. **Root Directory → `estate-edit-cms`** (important — it's a subfolder).
   Framework auto-detects as Next.js.
4. **Environment Variables:** add every var from `.env.example` (use the
   **transaction pooler** `DATABASE_URI`). Set `PAYLOAD_PUBLIC_SERVER_URL` and add
   the deployed origin to `PAYLOAD_PUBLIC_ALLOWED_ORIGINS`.
5. **Deploy.** Then open `/admin` and create the first admin user.

### B) Vercel CLI

```bash
npm i -g vercel
cd estate-edit-cms
vercel login          # links to your account (interactive)
vercel link           # set Root Directory to this folder
vercel env add ...    # add each var (or paste in the dashboard)
vercel --prod
```

### Notes

- Run DB migrations from your machine/CI (`npm run migrate`), **not** at request
  time. Vercel functions are serverless; migrations are a CLI step.
- Use the Supabase **transaction pooler** on Vercel (serverless-friendly). If you
  hit prepared-statement errors, that's the pooler mode — confirm it's the
  transaction pooler endpoint.
- Add CORS **PUT** for the Vercel origin on the Supabase bucket so admin uploads
  work from the deployed panel.
- Point a subdomain (e.g. `cms.your-domain`) at the Vercel project and update the
  two `PAYLOAD_PUBLIC_*` vars to match.

## Phase 2 (later): commerce

`@payloadcms/plugin-ecommerce` (beta) + a custom **M-Pesa** payment adapter:
fixed-price "Buy now" for transactional lots (furniture, equipment), while premium
one-off lots keep the enquiry/deposit flow. The Assets schema (status/price/
currency) is designed to extend into Products without rework.
