/**
 * Thin Payload adapter around the pure policy in policy.ts.
 *
 * Runs as the first collection `beforeChange` hook, so every write path is covered: admin,
 * REST, Local API with a user, restore-version and scheduled publish. It reads the request
 * (actor, publish or draft, unpublish), merges the governance group over the stored one, asks
 * `evaluateSave`, and either throws a public error or writes the corrected values back.
 */

import { APIError, type CollectionBeforeChangeHook, type CollectionBeforeDeleteHook } from 'payload'

import { hashContent, stableStringify } from './hash'
import { checkDelete, evaluateSave, type RecordState } from './policy'
import {
  actorFromRequest,
  normalizeOffice,
  ORIGINS,
  RISK_CLASSES,
  VERIFICATION_STATUSES,
  WORKFLOW_STATUSES,
  type Origin,
  type RiskClass,
  type VerificationStatus,
  type WorkflowStatus,
} from './roles'

type Gov = Record<string, unknown>

const pick = <T extends string>(allowed: readonly T[], value: unknown, fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

const idOf = (value: unknown): string | number | null => {
  if (value && typeof value === 'object' && 'id' in value)
    return (value as { id: string | number }).id
  return typeof value === 'string' || typeof value === 'number' ? value : null
}

export function toRecordState(gov: Gov | null | undefined): RecordState {
  const g = gov ?? {}
  return {
    status: pick<WorkflowStatus>(WORKFLOW_STATUSES, g.status, 'draft'),
    verification: pick<VerificationStatus>(
      VERIFICATION_STATUSES,
      g.verificationStatus,
      'unverified',
    ),
    risk: pick<RiskClass>(RISK_CLASSES, g.riskClass, 'standard'),
    ownerOffice: normalizeOffice(g.ownerOffice) || null,
    source: text(g.source),
    reviewDueAt: text(g.reviewDueAt),
    expireAt: text(g.expireAt),
    pinned: g.pinned === true,
    createdBy: idOf(g.createdBy),
  }
}

/** True when the request saves a draft revision rather than writing the live document. */
export function isDraftRequest(req: { query?: Record<string, unknown> }): boolean {
  const draft = req.query?.draft
  return draft === true || draft === 'true'
}

/**
 * Did the content fields change? Only fields present in the incoming data count (a partial
 * Local API update leaves the rest alone).
 */
export function contentChanged(
  data: Record<string, unknown>,
  original: Record<string, unknown> | null | undefined,
  fields: readonly string[],
): boolean {
  if (!original) return true
  return fields.some(
    (f) => f in data && stableStringify(data[f] ?? null) !== stableStringify(original[f] ?? null),
  )
}

export interface GovernanceOptions {
  /** Jobs, tenders, events and admissions cycles (LIF-04). */
  expiryRequired?: boolean
}

export const governanceBeforeChange =
  (contentFields: readonly string[], options: GovernanceOptions = {}): CollectionBeforeChangeHook =>
  async ({ data, originalDoc, operation, req, collection }) => {
    if (operation !== 'create' && operation !== 'update') return data

    const actor = actorFromRequest(req)
    const prevGov = (originalDoc?.governance ?? null) as Gov | null
    const merged: Gov = { ...(prevGov ?? {}), ...((data.governance as Gov | undefined) ?? {}) }

    const incomingStatus = data._status ?? originalDoc?._status
    const publishing = incomingStatus === 'published'
    // Unpublish: the request writes the live document as a draft. `originalDoc` is the latest
    // draft version when one is pending, so the live state is read from the published row.
    let unpublishing = false
    if (
      operation === 'update' &&
      data._status === 'draft' &&
      req.payloadAPI === 'REST' &&
      !isDraftRequest(req) &&
      originalDoc?.id != null
    ) {
      const live = (await req.payload.findByID({
        collection: collection.slug as 'pages',
        id: originalDoc.id,
        depth: 0,
        draft: false,
        req,
        overrideAccess: true,
      })) as { _status?: string }
      unpublishing = live._status === 'published'
    }

    const result = evaluateSave({
      operation,
      actor,
      publishing,
      unpublishing,
      expiryRequired: options.expiryRequired,
      prev: operation === 'update' ? toRecordState(prevGov) : null,
      next: toRecordState(merged),
      contentChanged:
        operation === 'create' ? true : contentChanged(data, originalDoc, contentFields),
      now: new Date().toISOString(),
    })

    if (!result.ok) {
      throw new APIError(result.message, result.httpStatus, { code: result.code }, true)
    }

    const { values } = result
    const system = actor.kind === 'system'
    const origin = pick<Origin>(ORIGINS, merged.origin, 'editor')

    const governance: Gov = {
      ...merged,
      status: values.status,
      verificationStatus: values.verification,
      riskClass: values.risk,
      pinned: values.pinned,
      ownerOffice: normalizeOffice(merged.ownerOffice) || null,
      verifiedAt:
        values.verification === 'verified'
          ? (values.verifiedAt ?? prevGov?.verifiedAt ?? null)
          : null,
      // Set by the system only; a person cannot claim a record came from an importer.
      origin: system ? origin : pick<Origin>(ORIGINS, prevGov?.origin, 'editor'),
      sourceContentHash: system
        ? (merged.sourceContentHash ?? null)
        : (prevGov?.sourceContentHash ?? null),
      collectedAt: system ? (merged.collectedAt ?? null) : (prevGov?.collectedAt ?? null),
      createdBy:
        idOf(prevGov?.createdBy) ?? (actor.kind === 'user' ? actor.id : idOf(merged.createdBy)),
      contentHash: hashContent({ ...(originalDoc ?? {}), ...data }, contentFields),
    }

    return { ...data, governance }
  }

/** Delete is judged on the latest saved state, which may be a draft the published row does not show. */
export const governanceBeforeDelete: CollectionBeforeDeleteHook = async ({
  collection,
  id,
  req,
}) => {
  const latest = (await req.payload.findByID({
    collection: collection.slug as 'pages',
    id,
    draft: true,
    depth: 0,
    req,
    overrideAccess: true,
  })) as { governance?: Gov | null }
  const denial = checkDelete(actorFromRequest(req), toRecordState(latest.governance))
  if (denial) throw new APIError(denial.message, denial.httpStatus, { code: denial.code }, true)
}
