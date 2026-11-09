import { APIError, type CollectionConfig, type PayloadRequest } from 'payload'

import { auditAfterLogin } from '../../governance/audit'
import { isPlatformAdmin } from '../../governance/access'
import { actorFromRequest, normalizeOffice, ROLE_LABELS, ROLES } from '../../governance/roles'

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

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Everyone with an account can open the admin. What they can do there is decided per collection.
    admin: ({ req }) => Boolean(req.user),
    create: ({ req }) => isPlatformAdmin(req),
    delete: ({ req }) => isPlatformAdmin(req),
    // Staff directory is not public or shared: admins, site managers and auditors see everyone;
    // everyone else sees only their own account.
    read: ({ req }) => {
      const actor = actorFromRequest(req)
      if (actor.kind !== 'user') return false
      if (
        actor.role === 'platformAdmin' ||
        actor.role === 'siteManager' ||
        actor.role === 'auditor'
      )
        return true
      return { id: { equals: actor.id } }
    },
    // Own account, or a platform admin. Role and offices are further limited by field access.
    update: ({ req }) => {
      const actor = actorFromRequest(req)
      if (actor.kind !== 'user') return false
      if (actor.role === 'platformAdmin') return true
      return { id: { equals: actor.id } }
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
    group: 'Governance',
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
      access: { update: ({ req }) => isPlatformAdmin(req) },
      admin: { description: 'The first account ever created becomes platform admin.' },
    },
    {
      name: 'offices',
      type: 'text',
      hasMany: true,
      access: { update: ({ req }) => isPlatformAdmin(req) },
      admin: {
        description:
          "Offices this person works for (matched against a record's owner office). Stored lower-case.",
      },
      hooks: {
        beforeValidate: [
          ({ value }) =>
            Array.isArray(value) ? [...new Set(value.map(normalizeOffice).filter(Boolean))] : value,
        ],
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
          return trusted ? data : { ...data, role: 'contributor', offices: [] }
        }

        // Update. Role and offices are only ever changed by a platform admin or the system.
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
      },
    ],
  },
  timestamps: true,
}
