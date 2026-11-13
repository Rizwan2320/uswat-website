/**
 * The importer's decisions. Pure: rows, records and what is already in the database go in; one
 * decision per route-map row comes out. No file, network or database access here.
 */
import { hashContent } from '../../apps/web/src/governance/hash'
import { legacyKey, parseCsv } from '../../apps/web/src/legacy/routeMap'

import { ARTICLE_COLLECTIONS, DEFAULT_COLLECTED_AT, type ArticleCollection, type SourceRecord } from './contract'
import { attachmentIssue, redactContacts } from './redact'

export type RouteRow = {
  line: number
  oldUrl: string
  collection: string
  newUrl: string
  action: string
}

export function readRouteRows(csv: string): RouteRow[] {
  const [header, ...body] = parseCsv(csv)
  const col = (n: string) => {
    const i = header.indexOf(n)
    if (i < 0) throw new Error(`route map: column "${n}" is missing`)
    return i
  }
  const [o, c, n, a] = [col('old_url'), col('new_collection'), col('proposed_new_url'), col('action')]
  return body.map((r, i) => ({ line: i + 2, oldUrl: r[o] ?? '', collection: r[c] ?? '', newUrl: r[n] ?? '', action: r[a] ?? '' }))
}

export const OUTCOMES = [
  'create',
  'update',
  'unchanged',
  'review',
  'redirect-only',
  'listing',
  'gone',
  'deferred',
  'skipped',
] as const
export type Outcome = (typeof OUTCOMES)[number]

/** A record as the importer would write it (CMS field names). */
export type MappedDoc = {
  title: string
  slug: string
  excerpt?: string
  text?: string
  publishedAt?: string
  tagNames: string[]
  attachments: { label: string; url: string }[]
  bodyStatus: 'full' | 'stub'
  governance: {
    origin: 'importer'
    source: string
    collectedAt: string
    sourceContentHash: string
  }
}

export type Decision = {
  line: number
  key: string
  outcome: Outcome
  reason?: string
  collection?: ArticleCollection
  doc?: MappedDoc
  existingId?: number | string
  /** Counts only; never values. */
  withheld?: { contacts: number; attachmentsDropped: number }
}

/** What is already stored for a key, as far as the importer needs. */
export type Existing = {
  id: number | string
  sourceContentHash: string | null
  origin: string | null
  verification: string | null
  status: string | null
}

export type Plan = { decisions: Decision[]; unmatchedRecords: string[]; duplicateRecords: string[] }

const SOURCE_FIELDS = ['title', 'slug', 'excerpt', 'text', 'publishedAt', 'tagNames', 'attachments'] as const

function lastSegment(newUrl: string): string {
  const seg = newUrl.replace(/\/+$/, '').split('/').pop() ?? ''
  try {
    return decodeURIComponent(seg)
  } catch {
    return seg
  }
}

const listingAction = (a: string) =>
  a.startsWith('replace with generated listing') || a.startsWith('merge: one filterable list') || a.startsWith('merge into one listing')

/** Map one record; returns a reason to skip instead of a doc when a required value is missing. */
export function mapRecord(
  slug: ArticleCollection,
  row: RouteRow,
  rec: SourceRecord,
): { doc: MappedDoc; withheld: { contacts: number; attachmentsDropped: number } } | { skip: string } {
  const prefix = slug === 'posts' ? '/news/' : `/${slug}/`
  if (!row.newUrl.startsWith(prefix) || !lastSegment(row.newUrl)) return { skip: 'new address does not match the collection' }
  const title = rec.title ? redactContacts(rec.title) : null
  if (!title || !title.text) return { skip: 'missing title' }
  const excerpt = rec.excerpt ? redactContacts(rec.excerpt) : null
  const text = rec.text ? redactContacts(rec.text) : null
  let dropped = 0
  const attachments: { label: string; url: string }[] = []
  let contacts = title.withheld + (excerpt?.withheld ?? 0) + (text?.withheld ?? 0)
  for (const a of rec.attachments) {
    const issue = attachmentIssue(a.url)
    if (issue === 'contact') contacts++
    if (issue) dropped++
    else attachments.push({ label: a.label ? redactContacts(a.label).text || 'Attachment' : 'Attachment', url: a.url.trim() })
  }
  const base = {
    title: title.text,
    slug: lastSegment(row.newUrl),
    excerpt: excerpt?.text || undefined,
    text: text?.text || undefined,
    publishedAt: rec.date,
    tagNames: [...new Set(rec.categories)].sort(),
    attachments,
  }
  const sourceContentHash = hashContent(base as unknown as Record<string, unknown>, SOURCE_FIELDS)
  return {
    doc: {
      ...base,
      bodyStatus: base.text ? 'full' : 'stub',
      governance: { origin: 'importer', source: row.oldUrl.trim(), collectedAt: DEFAULT_COLLECTED_AT, sourceContentHash },
    },
    withheld: { contacts, attachmentsDropped: dropped },
  }
}

export function planImport(input: {
  rows: RouteRow[]
  records: SourceRecord[]
  existing: Map<string, Existing>
}): Plan {
  const byKey = new Map<string, SourceRecord>()
  const duplicateRecords: string[] = []
  for (const rec of input.records) {
    const k = legacyKey(rec.url)
    if (byKey.has(k)) duplicateRecords.push(k)
    else byKey.set(k, rec)
  }
  const used = new Set<string>()
  const decisions: Decision[] = input.rows.map((row) => {
    const key = legacyKey(row.oldUrl)
    const d = (outcome: Outcome, reason?: string, extra: Partial<Decision> = {}): Decision => ({
      line: row.line,
      key,
      outcome,
      ...(reason ? { reason } : {}),
      ...extra,
    })
    const a = row.action
    if (a.startsWith('410')) return d('gone', 'dead link on the old site; answers 410')
    if (listingAction(a)) return d('listing', 'replaced by a generated listing; old address answers 301')
    if (a.startsWith('duplicate address') || a.startsWith('redirect to nearest parent'))
      return d('redirect-only', 'no record; old address answers 301')
    const slug = ARTICLE_COLLECTIONS[row.collection as keyof typeof ARTICLE_COLLECTIONS]
    if (!slug) return d('deferred', `${row.collection || 'no collection'}: not handled by this importer yet`)
    if (!a.startsWith('migrate')) return d('skipped', `unknown action "${a}"`)

    const rec = byKey.get(key)
    if (!rec) return d('skipped', 'no source record in the pack')
    used.add(key)
    const mapped = mapRecord(slug, row, rec)
    if ('skip' in mapped) return d('skipped', mapped.skip)
    const found = input.existing.get(key)
    const base = { collection: slug, doc: mapped.doc, withheld: mapped.withheld }
    if (!found) return d('create', undefined, base)
    if (found.sourceContentHash === mapped.doc.governance.sourceContentHash)
      return d('unchanged', undefined, { ...base, existingId: found.id })
    const untouched = found.origin === 'importer' && found.verification === 'unverified' && found.status === 'draft'
    return untouched
      ? d('update', 'source changed; draft not yet verified', { ...base, existingId: found.id })
      : d('review', 'source changed after a person worked on this record; not overwritten', { ...base, existingId: found.id })
  })
  const unmatchedRecords = [...byKey.keys()].filter((k) => !used.has(k))
  return { decisions, unmatchedRecords, duplicateRecords }
}
