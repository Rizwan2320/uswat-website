import { APIError, type CollectionConfig } from 'payload'

import { AUDIT_SLUG } from '../governance/audit'
import { actorFromRequest } from '../governance/roles'

const append = () => {
  throw new APIError('The audit log is append-only.', 403, { code: 'AUDIT_APPEND_ONLY' }, true)
}

/**
 * Append-only record of changes. No create, update or delete through the REST or GraphQL
 * API; entries are written by hooks using the Local API. Hooks reject updates and deletes
 * even from server code. (A database trigger would also bind the database role; not done,
 * because migrations here are generated, not hand-written.)
 */
export const AuditLogs: CollectionConfig = {
  slug: AUDIT_SLUG,
  labels: { singular: 'Audit entry', plural: 'Audit log' },
  admin: {
    useAsTitle: 'collection',
    defaultColumns: ['createdAt', 'action', 'collection', 'recordId', 'actorEmail'],
    group: 'Governance',
  },
  access: {
    read: ({ req }) => {
      const actor = actorFromRequest(req)
      return (
        actor.kind === 'user' &&
        (actor.role === 'platformAdmin' || actor.role === 'siteManager' || actor.role === 'auditor')
      )
    },
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeChange: [({ data, operation }) => (operation === 'update' ? append() : data)],
    beforeDelete: [append],
  },
  timestamps: true,
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      index: true,
      options: ['create', 'update', 'delete', 'login'],
    },
    { name: 'collection', type: 'text', required: true, index: true },
    { name: 'recordId', type: 'text', index: true },
    { name: 'actorKind', type: 'select', required: true, options: ['user', 'system', 'anonymous'] },
    { name: 'actorId', type: 'text', index: true },
    { name: 'actorRole', type: 'text' },
    { name: 'actorEmail', type: 'text' },
    { name: 'transitionFrom', type: 'text' },
    { name: 'transitionTo', type: 'text' },
    { name: 'locale', type: 'text' },
    { name: 'changes', type: 'json' },
  ],
}
