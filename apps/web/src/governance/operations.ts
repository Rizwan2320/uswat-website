/**
 * The Operations section of the admin home (slice 3t): is the automatic upkeep running, and what
 * is waiting, by office. Read-only. The rules are pure functions so they are unit-tested; the
 * loader at the bottom reads the database.
 *
 * Only platform admin, site manager and auditor may see it (the same people as the settings menu).
 */

import type { CollectionConfig, Payload } from 'payload'

import { EXPIRING_SOON_DAYS, QUEUES } from './dashboard'
import { LIFECYCLE_CRON } from './schedule'
import { actorFromUser, type Role } from './roles'

export const OPERATIONS_ROLES: Role[] = ['platformAdmin', 'siteManager', 'auditor']

/** PROPOSED: the sweep is hourly, so no finished run for 3 hours means something is wrong. */
export const SWEEP_LATE_AFTER_HOURS = 3
/** How many governed records per collection are counted before the panel says "partial". */
export const OFFICE_RECORD_CAP = 5000
/** How many recent sweep rows are read; the sweep runs hourly, so this covers four days. */
const SWEEP_ROWS = 100

const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

// ---------------------------------------------------------------- the sweep

export interface JobRow {
  createdAt?: string | null
  completedAt?: string | null
  hasError?: boolean | null
  log?: Array<{ state?: string | null; output?: { report?: unknown } | null }> | null
}

export interface SweepCounts {
  published: number
  archived: number
  markedStale: number
  skipped: number
  /** One line per skipped record: why it was left alone. */
  skippedReasons: string[]
  truncated: boolean
}

export interface SweepRun extends SweepCounts {
  /** When the run finished (or, for a failed run with no finish time, when it was queued). */
  at: string
  failed: boolean
  /** False when the run's report could not be read; the counts are then zero, not "none". */
  reportReadable: boolean
}

export type SweepState = 'never' | 'ok' | 'late' | 'failed'

export interface SweepSummary {
  state: SweepState
  /** One plain sentence for the top of the panel. */
  message: string
  last: SweepRun | null
  lastGood: SweepRun | null
  /** Runs finished in the last 24 hours, with the totals of what they did. */
  last24h: { runs: number; failures: number } & Pick<SweepCounts, 'published' | 'archived' | 'markedStale' | 'skipped'>
  /** The schedule, so the panel can say how often it expects a run. */
  cron: string
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Reads the sweep's report defensively. Anything unexpected gives `null`, never a made-up zero. */
export function readReport(report: unknown): SweepCounts | null {
  if (!isObj(report) || !isObj(report.collections)) return null
  const out: SweepCounts = {
    published: 0,
    archived: 0,
    markedStale: 0,
    skipped: 0,
    skippedReasons: [],
    truncated: false,
  }
  for (const [slug, c] of Object.entries(report.collections)) {
    if (!isObj(c)) continue
    out.published += num(c.published)
    out.archived += num(c.archived)
    out.markedStale += num(c.markedStale)
    if (c.truncated === true) out.truncated = true
    if (Array.isArray(c.skipped)) {
      for (const s of c.skipped) {
        if (!isObj(s)) continue
        out.skipped += 1
        out.skippedReasons.push(`${slug} #${String(s.id)}: ${String(s.reason ?? 'no reason given')}`)
      }
    }
  }
  return out
}

const finishedAt = (j: JobRow): string | null => j.completedAt ?? (j.hasError ? (j.createdAt ?? null) : null)

function toRun(job: JobRow): SweepRun | null {
  const at = finishedAt(job)
  if (!at) return null // still queued or running
  const failed = job.hasError === true
  const entry = [...(job.log ?? [])].reverse().find((l) => l?.output?.report !== undefined)
  const counts = readReport(entry?.output?.report)
  return {
    at,
    failed,
    reportReadable: counts !== null,
    ...(counts ?? { published: 0, archived: 0, markedStale: 0, skipped: 0, skippedReasons: [], truncated: false }),
  }
}

const ago = (fromIso: string, now: Date): string => {
  const minutes = Math.max(0, Math.round((now.getTime() - Date.parse(fromIso)) / 60_000))
  if (minutes < 90) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours} hours ago`
  return `${Math.round(hours / 24)} days ago`
}

/** Pure: what the recent sweep rows say about whether the upkeep is working. */
export function summarizeSweeps(jobs: JobRow[], now: Date, lateAfterHours = SWEEP_LATE_AFTER_HOURS): SweepSummary {
  const runs = jobs
    .map(toRun)
    .filter((r): r is SweepRun => r !== null)
    .sort((a, b) => b.at.localeCompare(a.at))
  const last = runs[0] ?? null
  const lastGood = runs.find((r) => !r.failed) ?? null
  const since = now.getTime() - DAY_MS
  const recent = runs.filter((r) => Date.parse(r.at) >= since)
  const last24h = {
    runs: recent.length,
    failures: recent.filter((r) => r.failed).length,
    published: recent.reduce((n, r) => n + r.published, 0),
    archived: recent.reduce((n, r) => n + r.archived, 0),
    markedStale: recent.reduce((n, r) => n + r.markedStale, 0),
    skipped: recent.reduce((n, r) => n + r.skipped, 0),
  }
  const base = { last, lastGood, last24h, cron: LIFECYCLE_CRON }

  if (!last) {
    return {
      ...base,
      state: 'never',
      message:
        'The automatic upkeep has not run yet (or its history was cleared). Scheduled publishing, expiry and review dates do nothing until it does. Check the scheduled GitHub Action and that CRON_SECRET matches.',
    }
  }
  if (last.failed) {
    return {
      ...base,
      state: 'failed',
      message: `The last automatic upkeep run, ${ago(last.at, now)}, failed.${
        lastGood ? ` The last good run was ${ago(lastGood.at, now)}.` : ' There has been no good run on record.'
      }`,
    }
  }
  if (now.getTime() - Date.parse(last.at) > lateAfterHours * HOUR_MS) {
    return {
      ...base,
      state: 'late',
      message: `The automatic upkeep last ran ${ago(last.at, now)}. It should run every hour, so the scheduler may have stopped.`,
    }
  }
  return {
    ...base,
    state: 'ok',
    message: `The automatic upkeep last ran ${ago(last.at, now)} and is on schedule.`,
  }
}

// ---------------------------------------------------------------- work by office

export interface OfficeRecord {
  ownerOffice?: string | null
  status?: string | null
  verificationStatus?: string | null
  reviewDueAt?: string | null
  expireAt?: string | null
}

export interface OfficeTally {
  /** The office name as recorded, or "(no office set)". */
  office: string
  drafts: number
  inReview: number
  stale: number
  expiringSoon: number
}

export const NO_OFFICE = '(no office set)'

/**
 * Pure. Counts the latest saved version of each record, by owner office. Archived records are
 * left out. Stale means marked Stale, or live with a review date that has passed (the same rule as
 * the editor dashboard). Expiring soon means approved or live with an end date within the
 * dashboard's window. A record can count in more than one column (a live page can be both).
 */
export function tallyOffices(records: OfficeRecord[], now: Date): OfficeTally[] {
  const nowIso = now.toISOString()
  const soonIso = new Date(now.getTime() + EXPIRING_SOON_DAYS * DAY_MS).toISOString()
  const byOffice = new Map<string, OfficeTally>()
  for (const r of records) {
    if (r.status === 'archived') continue
    const office = r.ownerOffice?.trim() || NO_OFFICE
    const t = byOffice.get(office) ?? { office, drafts: 0, inReview: 0, stale: 0, expiringSoon: 0 }
    if (r.status === 'draft') t.drafts += 1
    if (r.status === 'in_review') t.inReview += 1
    if (
      r.verificationStatus === 'stale' ||
      (r.status === 'published' && !!r.reviewDueAt && r.reviewDueAt <= nowIso)
    )
      t.stale += 1
    if (
      (r.status === 'approved' || r.status === 'published') &&
      !!r.expireAt &&
      r.expireAt > nowIso &&
      r.expireAt <= soonIso
    )
      t.expiringSoon += 1
    byOffice.set(office, t)
  }
  const waiting = (t: OfficeTally) => t.drafts + t.inReview + t.stale + t.expiringSoon
  return [...byOffice.values()]
    .filter((t) => waiting(t) > 0)
    .sort((a, b) => waiting(b) - waiting(a) || a.office.localeCompare(b.office))
}

// ---------------------------------------------------------------- loader

export interface OperationsData {
  sweep: SweepSummary
  offices: OfficeTally[]
  /** True when a collection had more records than the cap, or could not be read. */
  officesPartial: boolean
  imagesWithoutAlt: number | null
  generatedAt: string
}

const hasGovernance = (c: CollectionConfig): boolean =>
  c.fields.some((f) => f.type === 'group' && 'name' in f && f.name === 'governance')

type UserLike = { id: string | number; role?: unknown }

/** Returns `null` for anyone who may not see the section. Reads with system access, read-only. */
export async function loadOperations(
  payload: Payload,
  user: UserLike | null | undefined,
  now: Date = new Date(),
): Promise<OperationsData | null> {
  if (!user) return null
  const actor = actorFromUser(user)
  if (actor.kind !== 'user' || !OPERATIONS_ROLES.includes(actor.role)) return null

  const jobs = await payload.find({
    collection: 'payload-jobs',
    where: { taskSlug: { equals: 'lifecycleSweep' } },
    sort: '-createdAt',
    limit: SWEEP_ROWS,
    depth: 0,
    overrideAccess: true,
  })
  const sweep = summarizeSweeps(jobs.docs as unknown as JobRow[], now)

  let officesPartial = false
  const records: OfficeRecord[] = []
  for (const c of payload.config.collections.filter(hasGovernance)) {
    try {
      const res = await payload.find({
        collection: c.slug as 'pages',
        where: { 'governance.status': { not_equals: 'archived' } },
        draft: true,
        depth: 0,
        limit: OFFICE_RECORD_CAP,
        pagination: true,
        select: {
          governance: {
            status: true,
            ownerOffice: true,
            verificationStatus: true,
            reviewDueAt: true,
            expireAt: true,
          },
        } as never,
        overrideAccess: true,
      })
      if (res.totalDocs > OFFICE_RECORD_CAP) officesPartial = true
      for (const d of res.docs as unknown as Array<{ governance?: OfficeRecord & Record<string, unknown> }>) {
        const g = d.governance
        if (g) records.push(g)
      }
    } catch (error) {
      officesPartial = true
      payload.logger.error({ err: error, collection: c.slug }, 'operations: could not read a collection')
    }
  }

  let imagesWithoutAlt: number | null = null
  const alt = QUEUES.find((q) => q.key === 'needsAlt')
  if (alt && payload.config.collections.some((c) => c.slug === 'media')) {
    try {
      imagesWithoutAlt = (
        await payload.count({ collection: 'media', where: alt.where({ userId: user.id, now }), overrideAccess: true })
      ).totalDocs
    } catch (error) {
      payload.logger.error({ err: error }, 'operations: could not count images without alt text')
    }
  }

  return {
    sweep,
    offices: tallyOffices(records, now),
    officesPartial,
    imagesWithoutAlt,
    generatedAt: now.toISOString(),
  }
}
