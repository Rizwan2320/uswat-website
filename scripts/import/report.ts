import { OUTCOMES, type Plan } from './plan'

export type Report = {
  rows: number
  outcomes: Record<string, number>
  byCollection: Record<string, Record<string, number>>
  reasons: Record<string, number>
  contactsWithheld: number
  attachmentsDropped: number
  recordsNotInRouteMap: number
  duplicateRecordsInPack: number
  skipped: { line: number; key: string; reason: string }[]
}

export function buildReport(plan: Plan): Report {
  const outcomes = Object.fromEntries(OUTCOMES.map((o) => [o, 0])) as Record<string, number>
  const byCollection: Report['byCollection'] = {}
  const reasons: Record<string, number> = {}
  let contactsWithheld = 0
  let attachmentsDropped = 0
  const skipped: Report['skipped'] = []
  for (const d of plan.decisions) {
    outcomes[d.outcome]++
    const c = (byCollection[d.collection ?? '(not an article type)'] ??= {})
    c[d.outcome] = (c[d.outcome] ?? 0) + 1
    if (d.reason) reasons[`${d.outcome}: ${d.reason}`] = (reasons[`${d.outcome}: ${d.reason}`] ?? 0) + 1
    contactsWithheld += d.withheld?.contacts ?? 0
    attachmentsDropped += d.withheld?.attachmentsDropped ?? 0
    if (d.outcome === 'skipped') skipped.push({ line: d.line, key: d.key, reason: d.reason ?? '' })
  }
  return {
    rows: plan.decisions.length,
    outcomes,
    byCollection,
    reasons,
    contactsWithheld,
    attachmentsDropped,
    recordsNotInRouteMap: plan.unmatchedRecords.length,
    duplicateRecordsInPack: plan.duplicateRecords.length,
    skipped,
  }
}

/** Counts only. The per-skip list stays in the JSON file, which is not committed. */
export function reportMarkdown(r: Report, mode: string): string {
  const lines = [`# Importer report (${mode})`, '', `Route rows: ${r.rows}`, '', '| Outcome | Rows |', '|---|---|']
  for (const [o, n] of Object.entries(r.outcomes)) lines.push(`| ${o} | ${n} |`)
  lines.push('', '| Reason | Rows |', '|---|---|')
  for (const [k, n] of Object.entries(r.reasons).sort((a, b) => b[1] - a[1])) lines.push(`| ${k} | ${n} |`)
  lines.push(
    '',
    `Contact details withheld: ${r.contactsWithheld} (attachment links dropped: ${r.attachmentsDropped}). Pack records not in the route map: ${r.recordsNotInRouteMap}. Repeated records in the pack: ${r.duplicateRecordsInPack}.`,
  )
  return lines.join('\n') + '\n'
}
