/**
 * Media rules (plan v2 CMS-06, Addendum 12 MED-01/MED-03, importer rule 4).
 *
 * Pure decisions, no Payload imports, so they are unit-tested. The Payload adapter is in
 * `mediaGuard.ts`.
 */

import type { Where } from 'payload'

import type { Actor } from './roles'

/** Raster images only. SVG is left out on purpose: it can carry script. */
export const MEDIA_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const

/** PROPOSED limit, not a university rule: 8 MB. One constant so the owner can change it. */
export const MEDIA_MAX_BYTES = 8 * 1024 * 1024

export const RIGHTS_STATUSES = [
  'owned',
  'permission_granted',
  'permission_pending',
  'licensed',
  'unknown',
] as const
export type RightsStatus = (typeof RIGHTS_STATUSES)[number]

export const RIGHTS_LABELS: Record<RightsStatus, string> = {
  owned: 'Owned by the university',
  permission_granted: 'Permission granted',
  permission_pending: 'Permission pending (demo only)',
  licensed: 'Licensed',
  unknown: 'Unknown',
}

/**
 * Only `unknown` stops a publish. `permission_pending` is allowed because the competition demo
 * may show such images with a visible "sample image" mark; that mark is a template concern, not a
 * CMS rule. Production use of `permission_pending` is a decision for the owner (see the brief).
 */
export const RIGHTS_BLOCKING: readonly RightsStatus[] = ['unknown']

const REVIEWER_ROLES = ['platformAdmin', 'siteManager', 'approver']

export interface MediaRuleError {
  ok: false
  code: string
  message: string
  httpStatus: number
}

export interface MediaWriteInput {
  operation: 'create' | 'update'
  actor: Actor
  /** The alt text after this write (incoming merged over stored). */
  alt: unknown
  /** True when this request sends an `alt` value (so a person cannot blank it later). */
  altTouched: boolean
  /** The rights status after this write. */
  rights: unknown
  /** True when this request sends a `rightsStatus` other than the stored one. */
  rightsChanged: boolean
  /** Present when a file is uploaded with this write. */
  file?: { size: number; mimetype: string } | null
}

export const isBlank = (v: unknown): boolean => typeof v !== 'string' || v.trim() === ''

const fail = (code: string, message: string, httpStatus = 400): MediaRuleError => ({
  ok: false,
  code,
  message,
  httpStatus,
})

export function checkMediaWrite(i: MediaWriteInput): { ok: true } | MediaRuleError {
  if (i.file) {
    if (!(MEDIA_MIME_TYPES as readonly string[]).includes(i.file.mimetype)) {
      return fail(
        'MEDIA_TYPE_NOT_ALLOWED',
        `Only JPEG, PNG, WebP and AVIF images can be uploaded (got ${i.file.mimetype || 'unknown type'}).`,
      )
    }
    if (i.file.size > MEDIA_MAX_BYTES) {
      return fail(
        'MEDIA_TOO_LARGE',
        `The file is larger than the ${MEDIA_MAX_BYTES / 1024 / 1024} MB limit. Resize it and try again.`,
        413,
      )
    }
  }
  // A person must describe the picture. The system (importer) may leave it empty; the publish
  // guard and the needs-alt queue then hold the record back until someone writes it.
  if (i.actor.kind === 'user' && isBlank(i.alt) && (i.operation === 'create' || i.altTouched)) {
    return fail('ALT_REQUIRED', 'Add alt text that describes the image before saving it.')
  }
  // Rights are a judgment about the university's exposure: only reviewers may set them.
  if (
    i.actor.kind === 'user' &&
    !REVIEWER_ROLES.includes(i.actor.role) &&
    i.rightsChanged &&
    i.rights !== 'unknown'
  ) {
    return fail(
      'RIGHTS_REVIEWER_ONLY',
      'Only an approver or administrator can record the rights status of an image.',
      403,
    )
  }
  return { ok: true }
}

/** Why a stored media record cannot appear on a published page, or null. */
export function mediaPublishProblem(media: {
  alt?: unknown
  rightsStatus?: unknown
}): { code: 'MEDIA_ALT_MISSING' | 'MEDIA_RIGHTS_UNKNOWN'; what: string } | null {
  if (isBlank(media.alt)) return { code: 'MEDIA_ALT_MISSING', what: 'has no alt text' }
  const rights = typeof media.rightsStatus === 'string' ? media.rightsStatus : 'unknown'
  if ((RIGHTS_BLOCKING as readonly string[]).includes(rights)) {
    return { code: 'MEDIA_RIGHTS_UNKNOWN', what: 'has no recorded rights status' }
  }
  return null
}

/** Payload `where` for the "needs alt text" queue (importer rule 4). */
export const NEEDS_ALT_WHERE: Where = {
  or: [{ alt: { exists: false } }, { alt: { equals: '' } }],
}
