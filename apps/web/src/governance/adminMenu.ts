import { actorFromUser, type Role } from './roles'

/**
 * Who sees a settings area in the left menu and on the dashboard.
 *
 * This is tidiness, not security: access rules still decide what anyone can read or change
 * (see tests/int/access.matrix.int.spec.ts), and a hidden area can still be reached by its address.
 * Editors, approvers and contributors have no use for Users, Redirects, Forms, Search or the
 * Header and Footer, so showing them only invites clicks that end in "not allowed".
 */
export const SETTINGS_ROLES: readonly Role[] = ['platformAdmin', 'siteManager', 'auditor']

export const hiddenFromEditors = ({ user }: { user?: unknown }): boolean => {
  if (!user) return true
  const actor = actorFromUser(user as { id: string | number; role?: unknown })
  return actor.kind !== 'user' || !SETTINGS_ROLES.includes(actor.role)
}
