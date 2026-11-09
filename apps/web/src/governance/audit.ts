/**
 * Audit trail (CMS-05): who changed what, when, and how.
 *
 * Entries are written from collection and global hooks with the request's transaction, so a
 * failed audit write rolls the change back. Autosaves are skipped (they would drown the log).
 * Personal data (form submissions) and derived or internal collections are not audited.
 */

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterLoginHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { buildChanges } from './auditDiff'
import { actorFromRequest } from './roles'

export const AUDIT_SLUG = 'audit-logs'

/** Collections that are never audited, with the reason. */
export const AUDIT_EXCLUDED = new Set<string>([
  AUDIT_SLUG, // the log itself
  'form-submissions', // personal data from the public
  'search', // derived index
  'payload-locked-documents',
  'payload-preferences',
  'payload-migrations',
  'payload-jobs',
])

/** Globals that are never audited (written by Payload itself on every job run). */
export const AUDIT_EXCLUDED_GLOBALS = new Set<string>(['payload-jobs-stats'])

export type AuditAction = 'create' | 'update' | 'delete' | 'login'

interface Entry {
  action: AuditAction
  collection: string
  recordId?: string | number | null
  req: PayloadRequest
  previous?: Record<string, unknown> | null
  next?: Record<string, unknown> | null
}

const isAutosave = (req: PayloadRequest) => {
  const flag = (req.query as Record<string, unknown> | undefined)?.autosave
  return flag === true || flag === 'true'
}

const statusOf = (doc: Record<string, unknown> | null | undefined): string | null => {
  const gov = doc?.governance as { status?: unknown } | undefined
  return typeof gov?.status === 'string' ? gov.status : null
}

export async function writeAudit({
  action,
  collection,
  recordId,
  req,
  previous,
  next,
}: Entry): Promise<void> {
  const actor = actorFromRequest(req)
  const from = statusOf(previous)
  const to = statusOf(next)
  await req.payload.create({
    collection: AUDIT_SLUG,
    req, // same transaction as the change
    overrideAccess: true,
    data: {
      action,
      collection,
      recordId: recordId == null ? null : String(recordId),
      actorKind: actor.kind,
      actorId: actor.kind === 'user' ? String(actor.id) : null,
      actorRole: actor.kind === 'user' ? actor.role : null,
      actorEmail:
        actor.kind === 'user' ? ((req.user as { email?: string } | null)?.email ?? null) : null,
      transitionFrom: from !== to ? from : null,
      transitionTo: from !== to ? to : null,
      locale: typeof req.locale === 'string' ? req.locale : null,
      changes: action === 'login' ? {} : buildChanges(previous ?? null, next ?? null),
    },
  })
}

export const auditAfterChange =
  (collection: string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, operation, req }) => {
    if (isAutosave(req)) return doc
    await writeAudit({
      action: operation === 'create' ? 'create' : 'update',
      collection,
      recordId: doc?.id,
      req,
      previous: operation === 'create' ? null : previousDoc,
      next: doc,
    })
    return doc
  }

export const auditAfterDelete =
  (collection: string): CollectionAfterDeleteHook =>
  async ({ doc, id, req }) => {
    await writeAudit({ action: 'delete', collection, recordId: id, req, previous: doc, next: null })
    return doc
  }

export const auditAfterLogin: CollectionAfterLoginHook = async ({ user, req }) => {
  await writeAudit({
    action: 'login',
    collection: 'users',
    recordId: user?.id,
    req: { ...req, user } as PayloadRequest,
  })
  return user
}

export const auditGlobalAfterChange =
  (slug: string): GlobalAfterChangeHook =>
  async ({ doc, previousDoc, req }) => {
    if (isAutosave(req)) return doc
    await writeAudit({
      action: 'update',
      collection: slug,
      recordId: slug,
      req,
      previous: previousDoc,
      next: doc,
    })
    return doc
  }
