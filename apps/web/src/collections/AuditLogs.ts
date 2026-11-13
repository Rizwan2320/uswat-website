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
    group: 'Administration',
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
      label: 'What happened',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Created', value: 'create' },
        { label: 'Changed', value: 'update' },
        { label: 'Deleted', value: 'delete' },
        { label: 'Signed in', value: 'login' },
      ],
    },
    { name: 'collection', label: 'Kind of record', type: 'text', required: true, index: true },
    { name: 'recordId', label: 'Record number', type: 'text', index: true },
    {
      name: 'actorKind',
      label: 'Done by',
      type: 'select',
      required: true,
      options: [
        { label: 'A signed-in person', value: 'user' },
        { label: 'The system (scheduled job)', value: 'system' },
        { label: 'A visitor who was not signed in', value: 'anonymous' },
      ],
    },
    { name: 'actorId', label: 'Person number', type: 'text', index: true },
    { name: 'actorRole', label: 'Their role', type: 'text' },
    { name: 'actorEmail', label: 'Their email', type: 'text' },
    { name: 'transitionFrom', label: 'Moved from stage', type: 'text' },
    { name: 'transitionTo', label: 'Moved to stage', type: 'text' },
    { name: 'locale', label: 'Language', type: 'text' },
    { name: 'changes', label: 'What changed', type: 'json' },
  ],
}
