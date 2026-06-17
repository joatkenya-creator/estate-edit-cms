import { redirect } from 'next/navigation'

// This app is admin-only; the public marketing site lives elsewhere
// (Cloudflare Workers). Send the root straight to the Payload admin panel.
export default function HomePage() {
  redirect('/admin')
}
