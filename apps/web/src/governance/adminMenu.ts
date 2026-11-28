import { actorFromUser, type Role } from './roles'

/**
 * Who sees a settings area in the left menu and on the dashboard.
 *
 * This is tidiness, not security: access rules still decide what anyone can read or change
 * (see tests/int/access.matrix.int.spec.ts). Note that Payload also stops routing to an area that is
 * hidden for the signed-in person (the address shows "Nothing found"), so never hide an area that a
 * person has a link to: hide only its menu entry, with a style rule (see admin/PageNav/index.scss).
 * Editors, approvers and contributors have no use for Users, Redirects, Forms, Search or the
 * Header and Footer, so showing them only invites clicks that end in "not allowed".
 */
export const SETTINGS_ROLES: readonly Role[] = ['platformAdmin', 'siteManager', 'auditor']

export const hiddenFromEditors = ({ user }: { user?: unknown }): boolean => {
  if (!user) return true
  const actor = actorFromUser(user as { id: string | number; role?: unknown })
  return actor.kind !== 'user' || !SETTINGS_ROLES.includes(actor.role)
}

/**
 * Users is the one settings area a head of an office also sees (slice 3hod): scoped to their own team
 * by the collection's access rule, so the screen is theirs, not the whole staff directory.
 */
export const hiddenFromUsers = ({ user }: { user?: unknown }): boolean => {
  if (!user) return true
  if (!hiddenFromEditors({ user })) return false
  const actor = actorFromUser(user as { id: string | number; role?: unknown; offices?: unknown })
  return !(actor.kind === 'user' && actor.role === 'approver' && actor.offices.length > 0)
}

/**
 * A programme coordinator looks after their programme page(s) and the pictures on them, nothing else
 * (slice 3am), so the left menu and the home page show those and not the rest of the site. The
 * Programmes area stays routable (the link to their own page opens inside it, slice 3as); only its
 * menu entry is hidden, by the rule in admin/PageNav/index.scss.
 * Tidiness as above: access rules still decide.
 */
export const COORDINATOR_AREAS: readonly string[] = ['programmes', 'media']

export const isCoordinatorUser = (user: unknown): boolean => {
  if (!user) return false
  const actor = actorFromUser(user as { id: string | number; role?: unknown; programmes?: unknown })
  return actor.kind === 'user' && actor.role === 'editor' && (actor.programmes?.length ?? 0) > 0
}

type Hidden = boolean | ((args: { user: never }) => boolean) | undefined

/** Wraps a collection's own `admin.hidden` so a coordinator also does not see it. */
export function forCoordinators<T extends { slug: string; admin?: { hidden?: unknown } }>(c: T): T {
  if (COORDINATOR_AREAS.includes(c.slug)) return c
  const own = c.admin?.hidden as Hidden
  return {
    ...c,
    admin: {
      ...c.admin,
      hidden: (args: { user: never }) =>
        (typeof own === 'function' ? own(args) : Boolean(own)) || isCoordinatorUser(args.user),
    },
  }
}
