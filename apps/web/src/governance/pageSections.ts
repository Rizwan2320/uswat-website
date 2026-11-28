/**
 * The parts of a department or programme page that its head or coordinator controls, and which of them are
 * filled (slice 3ar). Only parts the public page really shows are listed: `departments.pageContent.location`
 * and `officeHours`, and `tagline` on both, are saved but the page does not show them yet, so they are not
 * here (checked against the renderers, 2026-11-27). Pure, no CMS access.
 * The keys are the fields of `pageContent` (src/collections/academics/pageFields.ts), plus `vision` and
 * `mission`, which sit on the department itself.
 */

export type PageCollection = 'departments' | 'programmes'

export interface PartStatus {
  key: string
  label: string
  /** How many rows or pictures, or 1 for a filled text. */
  count: number
  filled: boolean
  kind: 'text' | 'list' | 'pictures'
}

type Def = { key: string; label: string; kind: PartStatus['kind']; from?: 'doc'; pictures?: string[] }

const DEPARTMENT_PARTS: Def[] = [
  { key: 'intro', label: 'Introduction', kind: 'text' },
  { key: 'vision', label: 'Vision', kind: 'text', from: 'doc' },
  { key: 'mission', label: 'Mission', kind: 'text', from: 'doc' },
  { key: 'about', label: 'About the department', kind: 'list' },
  { key: 'highlights', label: 'Highlights', kind: 'list' },
  { key: 'labs', label: 'Labs', kind: 'list' },
  { key: 'researchAreas', label: 'Research areas', kind: 'list' },
  { key: 'careers', label: 'Careers', kind: 'list' },
  { key: 'studentLife', label: 'Student life', kind: 'list' },
  { key: 'alumni', label: 'Alumni', kind: 'list' },
  { key: 'faq', label: 'Questions and answers', kind: 'list' },
  { key: 'pictures', label: 'Pictures', kind: 'pictures', pictures: ['heroImage', 'campusPhoto'] },
]

const PROGRAMME_PARTS: Def[] = [
  { key: 'summary', label: 'Summary', kind: 'text' },
  { key: 'about', label: 'About the programme', kind: 'list' },
  { key: 'outcomes', label: 'Learning outcomes', kind: 'list' },
  { key: 'whyStudy', label: 'Why study it', kind: 'list' },
  { key: 'tracks', label: 'Tracks', kind: 'list' },
  { key: 'skills', label: 'Skills', kind: 'list' },
  { key: 'curriculum', label: 'Curriculum by semester', kind: 'list' },
  { key: 'careers', label: 'Careers', kind: 'list' },
  { key: 'alumni', label: 'Alumni', kind: 'list' },
  { key: 'faq', label: 'Questions and answers', kind: 'list' },
  {
    key: 'pictures',
    label: 'Pictures',
    kind: 'pictures',
    pictures: ['heroImage', 'tileImage', 'figureImage'],
  },
]

type Row = Record<string, unknown>
const isRow = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v)

export const PAGE_PARTS: Record<PageCollection, readonly Def[]> = {
  departments: DEPARTMENT_PARTS,
  programmes: PROGRAMME_PARTS,
}

export function describeParts(collection: PageCollection, doc: Row | null | undefined): PartStatus[] {
  const group: Row = isRow(doc?.pageContent) ? doc.pageContent : {}
  return PAGE_PARTS[collection].map((def) => {
    const value = def.from === 'doc' ? doc?.[def.key] : group[def.key]
    let count = 0
    if (def.kind === 'text') count = typeof value === 'string' && value.trim() ? 1 : 0
    else if (def.kind === 'list') count = Array.isArray(value) ? value.length : 0
    else count = (def.pictures ?? []).filter((k) => group[k] != null && group[k] !== '').length
    return { key: def.key, label: def.label, count, filled: count > 0, kind: def.kind }
  })
}

/** "7 of 12 parts filled", for the head's table. */
export const partsSummary = (parts: readonly PartStatus[]): string =>
  `${parts.filter((p) => p.filled).length} of ${parts.length} parts filled`

/** What each kind of count reads like beside a part: "3 rows", "2 pictures", "filled", "empty". */
export function partCountText(p: PartStatus): string {
  if (!p.filled) {
    if (p.key === 'alumni') return 'Empty: the page shows example entries'
    return p.kind === 'pictures'
      ? "Empty: the template's artwork shows"
      : 'Empty: the template shows its standard text'
  }
  if (p.kind === 'text') return 'Filled'
  if (p.kind === 'pictures') return p.count === 1 ? '1 picture' : `${p.count} pictures`
  return p.count === 1 ? '1 row' : `${p.count} rows`
}

/** The one sentence about what nobody edits here. */
export const TEMPLATE_FIXED =
  'The layout, the order and headings of the sections, the colours and the banner artwork are set by the university template and are the same on every page.'
