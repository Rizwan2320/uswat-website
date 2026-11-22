/**
 * Access control for governed collections (CMS-02, plan v2 7.3).
 *
 * Read: the public sees published records only. Platform admin, site manager and auditor see
 * everything; approver and editor see their offices; contributor sees what they created.
 * Update and delete are checked again against the latest saved state in the hooks. The workflow rules (who may move a
 * record where) are not here: they live in policy.ts and run in the beforeChange hook.
 */

import type { Access, PayloadRequest, Where } from 'payload'

import { ADMIN_ONLY_COLLECTIONS } from './policy'
import { actorFromRequest, type Actor } from './roles'

const prefixed = (prefix: string, path: string) => `${prefix}${path}`

const asId = (v: string): string | number => (/^\d+$/.test(v) ? Number(v) : v)

/**
 * Records an actor may see among unpublished ones, as a query filter (or true / false).
 * `slug` (slice 3ah) lets the filter know which collection it is for: main pages are never in an
 * approver's or editor's scope, and a programme coordinator sees their own programmes by id (never by
 * office, and never a department). An id means something different in each collection, so these
 * filters are built per collection.
 */
function scopeFilter(actor: Actor, prefix = '', slug?: string, versions = false): boolean | Where {
  if (actor.kind !== 'user') return false
  switch (actor.role) {
    case 'platformAdmin':
    case 'siteManager':
    case 'auditor':
      return true
    case 'approver':
    case 'editor':
      if (slug && ADMIN_ONLY_COLLECTIONS.has(slug)) return false
      if (slug && actor.role === 'editor' && (actor.programmes?.length ?? 0) > 0) {
        if (slug === 'programmes')
          return { [versions ? 'parent' : 'id']: { in: (actor.programmes ?? []).map(asId) } }
        if (slug === 'departments') return false
      }
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

function readFor(req: PayloadRequest, prefix = '', slug?: string): boolean | Where {
  const actor = actorFromRequest(req)
  const scope = scopeFilter(actor, prefix, slug)
  if (scope === true) return true
  return scope === false ? published(prefix) : { or: [published(prefix), scope] }
}

export const governedRead: Access = ({ req }) => readFor(req)
/** The same, for one named collection (main pages, programme coordinators). */
export const governedReadFor =
  (slug: string): Access =>
  ({ req }) =>
    readFor(req, '', slug)
/** Versions are filtered on the `version.` prefix. */
export const governedReadVersions: Access = ({ req }) => {
  const actor = actorFromRequest(req)
  const scope = scopeFilter(actor, 'version.')
  return scope === false ? false : scope
}
export const governedReadVersionsFor =
  (slug: string): Access =>
  ({ req }) => {
    const actor = actorFromRequest(req)
    const scope = scopeFilter(actor, 'version.', slug, true)
    return scope === false ? false : scope
  }

export const governedCreate: Access = ({ req }) => {
  const actor = actorFromRequest(req)
  return actor.kind === 'user' && actor.role !== 'auditor'
}

/**
 * Creating a department or a programme is for the platform admin only (owner decision, 2026-11-21):
 * the structure of the university is not something editors or approvers add to. They still edit and
 * publish the content of the ones that exist. The importer and the seeds use the system actor
 * (no user, Local API), which does not go through this rule.
 */
export const governedCreateAdminOnly: Access = ({ req }) => {
  const actor = actorFromRequest(req)
  return actor.kind === 'user' && actor.role === 'platformAdmin'
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

/**
 * Deleting is judged by `checkDelete` in the beforeDelete hook, on the latest saved state (slice 3q):
 * a draft that was never published may be deleted by whoever may edit it; anything else only by a
 * platform admin (or a site manager if it is not High impact). Access only turns away roles that
 * can never delete, for the same reason as `governedUpdate`.
 */
export const governedDelete: Access = ({ req }) => {
  const actor = actorFromRequest(req)
  return actor.kind === 'user' && actor.role !== 'auditor'
}

export const isPlatformAdmin = (req: PayloadRequest): boolean => {
  const actor = actorFromRequest(req)
  return actor.kind === 'user' && actor.role === 'platformAdmin'
}
