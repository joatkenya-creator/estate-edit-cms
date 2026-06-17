import type { ReactNode } from 'react'

export const metadata = {
  title: 'The Estate Edit — CMS',
  description: 'Content management for The Estate Edit.',
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
