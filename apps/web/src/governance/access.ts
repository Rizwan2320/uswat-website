/**
 * Access control for governed collections (CMS-02, plan v2 7.3).
 *
 * Read: the public sees published records only. Platform admin, site manager and auditor see
 * everything; approver and editor see their offices; contributor sees what they created.
 * Update and delete are checked again against the latest saved state in the hooks. The workflow rules (who may move a
 * record where) are not here: they live in policy.ts and run in the beforeChange hook.
 */

import type { Access, PayloadRequest, Where } from 'payload'

import { actorFromRequest, type Actor } from './roles'

const prefixed = (prefix: string, path: string) => `${prefix}${path}`

/** Records an actor may see among unpublished ones, as a query filter (or true / false). */
function scopeFilter(actor: Actor, prefix = ''): boolean | Where {
  if (actor.kind !== 'user') return false
  switch (actor.role) {
    case 'platformAdmin':
    case 'siteManager':
    case 'auditor':
      return true
    case 'approver':
    case 'editor':
      return actor.offices.length === 0
        ? false
        : { [prefixed(prefix, 'governance.ownerOffice')]: { in: actor.offices } }
    case 'contributor':
      return { [prefixed(prefix, 'governance.createdBy')]: { equals: actor.id } }
  }
}

const published = (prefix = ''): Where => ({
  [prefixed(prefix, '_status')]: { equals: 'published' },
})

function readFor(req: PayloadRequest, prefix = ''): boolean | Where {
  const actor = actorFromRequest(req)
  const scope = scopeFilter(actor, prefix)
  if (scope === true) return true
  return scope === false ? published(prefix) : { or: [published(prefix), scope] }
}

export const governedRead: Access = ({ req }) => readFor(req)
/** Versions are filtered on the `version.` prefix. */
export const governedReadVersions: Access = ({ req }) => {
  const actor = actorFromRequest(req)
  const scope = scopeFilter(actor, 'version.')
  return scope === false ? false : scope
}

export const governedCreate: Access = ({ req }) => {
  const actor = actorFromRequest(req)
  return actor.kind === 'user' && actor.role !== 'auditor'
}

/**
 * Update and delete are decided by the policy hooks, not by a database filter: draft saves
 * live in the versions table, so the published row's office, status and risk class can be
 * stale. Access only turns away roles that can never write.
 */
export const governedUpdate: Access = ({ req }) => {
  const actor = actorFromRequest(req)
  return actor.kind === 'user' && actor.role !== 'auditor'
}

export const governedDelete: Access = ({ req }) => {
  const actor = actorFromRequest(req)
  return actor.kind === 'user' && (actor.role === 'platformAdmin' || actor.role === 'siteManager')
}

export const isPlatformAdmin = (req: PayloadRequest): boolean => {
  const actor = actorFromRequest(req)
  return actor.kind === 'user' && actor.role === 'platformAdmin'
}
