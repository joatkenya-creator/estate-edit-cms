import type { Access, FieldAccess } from 'payload'

/**
 * Role model for The Estate Edit CMS.
 *   admin  — full control, including managing other users.
 *   editor — manages all content + inquiries, but not users or roles.
 *
 * Every collection is behind auth (no public Payload access); the public
 * marketing site reads/writes the database directly via Supabase + RLS, NOT
 * through Payload's API.
 */

type Role = 'admin' | 'editor'

const hasRole = (user: unknown, role: Role): boolean =>
  Boolean(user && typeof user === 'object' && (user as { role?: Role }).role === role)

/** Any authenticated CMS user (admin or editor). */
export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)

/** Admins only. */
export const isAdmin: Access = ({ req: { user } }) => hasRole(user, 'admin')

/** Admins only — field-level (e.g. who can change a user's role). */
export const isAdminField: FieldAccess = ({ req: { user } }) => hasRole(user, 'admin')

/** Admins always; editors only on their own user document. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (hasRole(user, 'admin')) return true
  if (user) return { id: { equals: (user as { id: string }).id } }
  return false
}
