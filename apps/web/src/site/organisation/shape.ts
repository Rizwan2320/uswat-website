/* Pure helpers for the department and programme pages (T3, T4). Nothing here opens the CMS, so unit tests can use it. */

export const DEPARTMENTS_PATH = '/academics/departments'
export const PROGRAMMES_PATH = '/academics/programmes'
export const OFFICES_PATH = '/administration'
export const LIST_REVALIDATE_SECONDS = 300

export type Doc = Record<string, unknown> & { id: number | string }
export const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)
export const rel = (v: unknown): Doc | null => (v && typeof v === 'object' ? (v as Doc) : null)

/** Records made by `pnpm seed:sample` (and any other invented data) carry a source on this host. */
export const SAMPLE_HOST = 'sample.invalid'
export function isSample(doc: Doc): boolean {
  const source = str((doc.governance as { source?: unknown } | null | undefined)?.source)
  if (!source) return false
  try {
    return new URL(source).hostname === SAMPLE_HOST
  } catch {
    return false
  }
}

/** A text area from the CMS as paragraphs: blank lines separate them, single line breaks stay inside one. */
export function paragraphs(text: unknown): string[] {
  const t = str(text)
  return t ? t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) : []
}

export const departmentHref = (slug: string) => `${DEPARTMENTS_PATH}/${encodeURIComponent(slug)}`
export const officeHref = (slug: string) => `${OFFICES_PATH}/${encodeURIComponent(slug)}`
export const programmeHref = (slug: string) => `${PROGRAMMES_PATH}/${encodeURIComponent(slug)}`

/** Groups in the order they first appear, so a list sorted by name stays sorted inside each group. */
export function groupBy<T>(items: T[], key: (item: T) => { id: string; label: string }): { id: string; label: string; items: T[] }[] {
  const out = new Map<string, { id: string; label: string; items: T[] }>()
  for (const item of items) {
    const k = key(item)
    const group = out.get(k.id) ?? { ...k, items: [] }
    group.items.push(item)
    out.set(k.id, group)
  }
  return [...out.values()]
}

/** Case- and accent-insensitive by-name order that sorts the same on every machine. */
export const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })

export type DepartmentCard = { id: number | string; name: string; slug: string; summary: string | null; groupId: string; groupName: string; sample: boolean }
export type ProgrammeCard = {
  id: number | string
  name: string
  slug: string
  level: string | null
  duration: string | null
  campus: string | null
  departmentId: string
  departmentName: string
  sample: boolean
}

export const NO_GROUP = { id: 'none', label: 'Other departments' }

export function toDepartmentCard(d: Doc): DepartmentCard | null {
  const name = str(d.name)
  const slug = str(d.slug)
  if (!name || !slug) return null
  const group = rel(d.facultyGroup)
  return {
    id: d.id,
    name,
    slug,
    summary: str(d.summary),
    groupId: group ? String(group.id) : NO_GROUP.id,
    groupName: str(group?.name) ?? NO_GROUP.label,
    sample: isSample(d),
  }
}

export function toProgrammeCard(p: Doc): ProgrammeCard | null {
  const name = str(p.name)
  const slug = str(p.slug)
  if (!name || !slug) return null
  const dept = rel(p.department)
  return {
    id: p.id,
    name,
    slug,
    level: str(p.level),
    duration: str(p.duration),
    campus: str(rel(p.campus)?.name),
    departmentId: dept ? String(dept.id) : 'none',
    departmentName: str(dept?.name) ?? 'Other programmes',
    sample: isSample(p),
  }
}
