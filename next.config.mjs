import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Payload runs its own admin UI + REST/GraphQL API inside this Next app.
  // This app is deployed to Vercel (a persistent Node runtime), separate from
  // the public marketing site which stays on Cloudflare Workers.
}

export default withPayload(nextConfig)
