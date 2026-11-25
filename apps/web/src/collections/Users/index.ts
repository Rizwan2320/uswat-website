import {
  APIError,
  type Access,
  type CollectionConfig,
  type PayloadRequest,
  type Where,
} from 'payload'

import { auditAfterLogin } from '../../governance/audit'
import { isPlatformAdmin } from '../../governance/access'
import { hiddenFromUsers } from '../../governance/adminMenu'
import { actorFromRequest, normalizeOffice, ROLE_LABELS, ROLES } from '../../governance/roles'
import {
  checkTeamCreate,
  checkTeamDelete,
  checkTeamUpdate,
  managesTeam,
  teamOffices,
  type TeamDenial,
} from '../../governance/teamAccess'

const teamError = (d: TeamDenial) => new APIError(d.message, 403, { code: d.code }, true)

/** The people a head manages: Editors and Contributors who share one of the head's offices. */
const teamWhere = (offices: string[]): Where => ({
  and: [{ role: { in: ['editor', 'contributor'] } }, { offices: { in: offices } }],
})

/** A platform admin, or a head who holds at least one office (the hooks hold the real limits). */
const adminOrHead = ({ req }: { req: PayloadRequest }): boolean =>
  isPlatformAdmin(req) || managesTeam(actorFromRequest(req))

const lastAdminError = () =>
  new APIError(
    'This is the last platform admin. Make someone else a platform admin first.',
    400,
    { code: 'LAST_ADMIN' },
    true,
  )

async function otherAdmins(req: PayloadRequest, excludeId: string | number): Promise<number> {
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    req,
    overrideAccess: true,
    where: { and: [{ role: { equals: 'platformAdmin' } }, { id: { not_equals: excludeId } }] },
  })
  return totalDocs
}

/**
 * A head of department may give a coordinator only programmes of their own offices (slice 3ah), and
 * only to an Editor. The platform admin and trusted code are not limited (they never reach this).
 */
async function assertProgrammesOwned(
  req: PayloadRequest,
  actor: ReturnType<typeof actorFromRequest>,
  value: unknown,
  role: string,
): Promise<void> {
  if (value === undefined || !Array.isArray(value) || value.length === 0) return
  if (role !== 'editor') {
    throw new APIError(
      'Only an Editor can be given programmes to look after.',
      403,
      { code: 'TEAM_PROGRAMME_FORBIDDEN' },
      true,
    )
  }
  const mine = actor.kind === 'user' ? actor.offices : []
  for (const ref of value) {
    const id = typeof ref === 'object' && ref !== null ? (ref as { id?: unknown }).id : ref
    const programme = (await req.payload
      .findByID({
        collection: 'programmes',
        id: id as number,
        depth: 0,
        draft: true,
        overrideAccess: true,
        req,
      })
      .catch(() => null)) as { governance?: { ownerOffice?: unknown } } | null
    const office = normalizeOffice(String(programme?.governance?.ownerOffice ?? ''))
    if (!office || !mine.includes(office)) {
      throw new APIError(
        'You can give a coordinator only programmes of your own department.',
        403,
        { code: 'TEAM_PROGRAMME_FORBIDDEN' },
        true,
      )
    }
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Everyone with an account can open the admin. What they can do there is decided per collection.
    admin: ({ req }) => Boolean(req.user),
    // A platform admin, or a head of an office (slice 3hod): the hooks below hold the head's limits.
    create: adminOrHead,
    delete: (({ req }) => {
      const actor = actorFromRequest(req)
      if (actor.kind !== 'user') return false
      if (actor.role === 'platformAdmin') return true
      return managesTeam(actor) ? teamWhere(teamOffices(actor)) : false
    }) as Access,
    // Staff directory is not public or shared: admins, site managers and auditors see everyone;
    // a head sees their own team and themselves; everyone else sees only their own account.
    read: (({ req }) => {
      const actor = actorFromRequest(req)
      if (actor.kind !== 'user') return false
      if (
        actor.role === 'platformAdmin' ||
        actor.role === 'siteManager' ||
        actor.role === 'auditor'
      )
        return true
      if (managesTeam(actor))
        return { or: [{ id: { equals: actor.id } }, teamWhere(teamOffices(actor))] }
      return { id: { equals: actor.id } }
    }) as Access,
    // Own account, a platform admin, or (for a head) their team. Role and offices are further
    // limited by field access and by the hooks below.
    update: (({ req }) => {
      const actor = actorFromRequest(req)
      if (actor.kind !== 'user') return false
      if (actor.role === 'platformAdmin') return true
      if (managesTeam(actor))
        return { or: [{ id: { equals: actor.id } }, teamWhere(teamOffices(actor))] }
      return { id: { equals: actor.id } }
    }) as Access,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
    group: 'Administration',
    // Everyone can still reach their own account from the avatar at the top right.
    hidden: hiddenFromUsers,
  },
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'contributor',
      options: ROLES.map((value) => ({ value, label: ROLE_LABELS[value] })),
      saveToJWT: true,
      access: { update: adminOrHead },
      admin: {
        description:
          'The first account ever created becomes platform admin. A head of an office may set Editor or Contributor for their own team.',
      },
    },
    {
      name: 'offices',
      type: 'text',
      hasMany: true,
      access: { update: adminOrHead },
      admin: {
        // Chosen from the departments, not typed (slice 3aq). The stored value is the same list of words.
        components: { Field: '@/admin/OfficePicker' },
        description:
          "Offices this person works for (matched against a record's owner office). Stored lower-case. A head of an office can add or take away only their own offices.",
      },
      hooks: {
        beforeValidate: [
          ({ value }) =>
            Array.isArray(value) ? [...new Set(value.map(normalizeOffice).filter(Boolean))] : value,
        ],
      },
    },
    {
      name: 'programmes',
      label: 'Programmes they coordinate',
      type: 'relationship',
      relationTo: 'programmes',
      hasMany: true,
      // Only a platform admin decides who coordinates which programme (slice 3ah).
      // The platform admin, or a head of department for their own team (checked in the hook below:
      // only programmes of the head's own offices, and only on an Editor).
      access: { update: adminOrHead },
      // A head is offered only programmes of their own office (slice 3aq); the hook below still refuses others.
      filterOptions: ({ user }) => {
        const u = user as { role?: string; offices?: unknown } | null
        const offices = Array.isArray(u?.offices) ? (u.offices as string[]) : []
        if (u?.role !== 'approver' || offices.length === 0) return true
        return { 'governance.ownerOffice': { in: offices } }
      },
      // Payload checks a chosen value against filterOptions by reading it back as the person saving, which a
      // coordinator cannot do for a department that is still a draft or no longer published (found by the scope
      // tests). The list only narrows what is offered; the scope rule and the team hook still refuse the rest on save.
      validate: () => true as const,
      admin: {
        condition: (data) => data?.role === 'editor',
        description:
          'For a programme coordinator: the programmes this person writes drafts for. They can edit only these programmes (not the department page, not other programmes) and send them to the head of the department. A head of department can pick only programmes of their own department. Leave empty for an Editor of a whole office.',
      },
    },
  ],
  hooks: {
    afterLogin: [auditAfterLogin],
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        const actor = actorFromRequest(req)
        const trusted =
          actor.kind === 'system' || (actor.kind === 'user' && actor.role === 'platformAdmin')

        if (operation === 'create') {
          // Bootstrapping: the first account created by a person (the admin's create-first-user
          // screen) is the platform admin. Trusted server code keeps the role it asks for.
          if (actor.kind !== 'system') {
            const { totalDocs } = await req.payload.count({
              collection: 'users',
              req,
              overrideAccess: true,
            })
            if (totalDocs === 0) return { ...data, role: 'platformAdmin' }
          }
          if (!trusted && managesTeam(actor)) {
            const result = checkTeamCreate(actor, data)
            if (!result.ok) throw teamError(result)
            await assertProgrammesOwned(req, actor, data.programmes, result.role)
            return { ...data, role: result.role, offices: result.offices }
          }
          return trusted ? data : { ...data, role: 'contributor', offices: [] }
        }

        // Update. Role and offices are changed by a platform admin or the system, or, for a team
        // member, by their head within the limits of teamAccess.ts.
        const own = actor.kind === 'user' && String(actor.id) === String(originalDoc?.id)
        if (!trusted && !own && managesTeam(actor)) {
          const result = checkTeamUpdate(actor, originalDoc ?? {}, data)
          if (!result.ok) throw teamError(result)
          await assertProgrammesOwned(req, actor, data.programmes, result.role)
          return { ...data, role: result.role, offices: result.offices }
        }
        const next = { ...data }
        if (!trusted) {
          next.role = originalDoc?.role
          next.offices = originalDoc?.offices
        }
        if (originalDoc?.role === 'platformAdmin' && next.role && next.role !== 'platformAdmin') {
          if ((await otherAdmins(req, originalDoc.id)) === 0) throw lastAdminError()
        }
        return next
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({
          collection: 'users',
          id,
          req,
          depth: 0,
          overrideAccess: true,
        })
        if (doc.role === 'platformAdmin' && (await otherAdmins(req, id)) === 0)
          throw lastAdminError()
        const actor = actorFromRequest(req)
        if (actor.kind === 'user' && actor.role !== 'platformAdmin') {
          const denial = checkTeamDelete(actor, doc)
          if (denial) throw teamError(denial)
        }
      },
    ],
  },
  timestamps: true,
}
