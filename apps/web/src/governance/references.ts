/**
 * "Is anything still using this?" (slice 3s, docs/briefs/p3s-integrity.md).
 *
 * Deleting a Department that twelve People still point to would leave twelve broken records. So a
 * delete is refused while other records reference the one being deleted, and the message says how
 * many of what.
 *
 * The fields that point at a collection are found from the finished Payload config, not from a list
 * someone has to keep in step. Left out on purpose:
 *  - `users`: staff must stay removable, and every governed record points at its creator;
 *  - the audit log, search index, form data and Payload's own system collections: they hold history
 *    or derived copies, not live links;
 *  - breadcrumbs, populated authors and the creator field: derived or historical, not live links.
 *
 * Globals (the home page content, the header, the footer) are one record each, so they are read and
 * their data is searched for the id, in the published version and in the newest draft.
 */

import type { Payload, PayloadRequest, Where } from 'payload'

type Loose = Record<string, unknown>
const isObject = (v: unknown): v is Loose =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Where a link to another record is stored. */
export interface ReferenceField {
  collection: string
  /** Dotted path, as Payload's `where` wants it (`programmes.college`). */
  path: string
  /** The target is one of several (`relationTo: ['pages', 'posts']`). */
  polymorphic: boolean
  /** Many records can sit in this one field. */
  hasMany: boolean
}

const SKIP_SOURCE = (slug: string): boolean =>
  slug.startsWith('payload-') ||
  ['users', 'audit-logs', 'search', 'forms', 'form-submissions'].includes(slug)
const SKIP_TARGET = new Set(['users'])
const SKIP_FIELD = new Set(['createdBy', 'breadcrumbs', 'populatedAuthors', 'folder', 'doc'])

const targetsOf = (field: Loose): string[] => {
  const to = field.relationTo
  return typeof to === 'string' ? [to] : Array.isArray(to) ? to.map(String) : []
}

function walk(
  fields: unknown,
  prefix: string,
  collection: string,
  target: string,
  out: ReferenceField[],
): void {
  if (!Array.isArray(fields)) return
  for (const raw of fields) {
    if (!isObject(raw)) continue
    const name = typeof raw.name === 'string' ? raw.name : undefined
    if (name && SKIP_FIELD.has(name)) continue
    const path = name ? (prefix ? `${prefix}.${name}` : name) : prefix

    if (raw.type === 'tabs' && Array.isArray(raw.tabs)) {
      for (const tab of raw.tabs as Loose[]) {
        const tabName = typeof tab.name === 'string' ? tab.name : undefined
        walk(
          tab.fields,
          tabName ? (prefix ? `${prefix}.${tabName}` : tabName) : prefix,
          collection,
          target,
          out,
        )
      }
      continue
    }
    if ((raw.type === 'relationship' || raw.type === 'upload') && name) {
      const targets = targetsOf(raw)
      if (targets.includes(target)) {
        out.push({
          collection,
          path,
          polymorphic: typeof raw.relationTo !== 'string',
          hasMany: raw.hasMany === true,
        })
      }
    }
    if (Array.isArray(raw.blocks)) {
      for (const block of raw.blocks as Loose[]) walk(block.fields, path, collection, target, out)
    }
    if (raw.fields !== undefined) walk(raw.fields, path, collection, target, out)
  }
}

/** Every field, in every collection, that can hold a link to `target`. Pure: takes the config. */
export function referenceFields(
  collections: readonly { slug: string; fields: unknown }[],
  target: string,
): ReferenceField[] {
  if (SKIP_TARGET.has(target) || target.startsWith('payload-')) return []
  const out: ReferenceField[] = []
  for (const c of collections) {
    if (SKIP_SOURCE(c.slug)) continue
    walk(c.fields, '', c.slug, target, out)
  }
  return out
}

const labelOf = (c: { slug: string; labels?: unknown }): string => {
  const plural = isObject(c.labels) ? c.labels.plural : undefined
  if (typeof plural === 'string') return plural
  if (isObject(plural) && typeof plural.en === 'string') return plural.en
  return c.slug
}

/** The `where` that finds records whose field points at `id` of `target`. Exported for tests. */
export function whereReferences(
  ref: ReferenceField,
  target: string,
  id: string | number,
  selfId?: string | number,
): Where {
  // A link that can point at several collections is queried in Payload's object form.
  const link: Where = ref.polymorphic
    ? { [ref.path]: { equals: { relationTo: target, value: id } } }
    : { [ref.path]: { equals: id } }
  // A record that points at itself (a category's parent chain) does not stop its own deletion.
  return selfId !== undefined && ref.collection === target
    ? { and: [link, { id: { not_equals: selfId } }] }
    : link
}

export interface InUse {
  /** Plural collection label (for example "People") and how many records use this one. */
  label: string
  collection: string
  count: number
  /** True when `collection` is the slug of a global (one record), and `label` is its own name. */
  global?: boolean
}

type FieldLike = Loose
const sameId = (a: unknown, b: unknown): boolean => String(a) === String(b)

/** Does one stored link value point at `id` of `target`? Handles an id, a populated record and `{ relationTo, value }`. */
function linkPointsAt(value: unknown, target: string, id: string | number): boolean {
  if (Array.isArray(value)) return value.some((v) => linkPointsAt(v, target, id))
  if (!isObject(value)) return value !== null && value !== undefined && sameId(value, id)
  if ('relationTo' in value) {
    return value.relationTo === target && linkPointsAt(value.value, target, id)
  }
  return 'id' in value && sameId(value.id, id)
}

/**
 * Does `data` (the stored content of a global) hold a link to `id` of `target`? Walks the field config
 * alongside the data, through groups, tabs, arrays and blocks. Pure, so it is unit-tested without a database.
 * A localized field read with `locale: 'all'` is an object keyed by language, so each language is checked.
 */
export function dataReferences(
  fields: unknown,
  data: unknown,
  target: string,
  id: string | number,
  globalBlocks: readonly FieldLike[] = [],
): boolean {
  if (!Array.isArray(fields) || !isObject(data)) return false
  const again = (f: unknown, d: unknown) => dataReferences(f, d, target, id, globalBlocks)
  for (const raw of fields as FieldLike[]) {
    if (!isObject(raw)) continue
    const name = typeof raw.name === 'string' ? raw.name : undefined
    if (name && SKIP_FIELD.has(name)) continue

    if (raw.type === 'tabs' && Array.isArray(raw.tabs)) {
      for (const tab of raw.tabs as Loose[]) {
        const tabName = typeof tab.name === 'string' ? tab.name : undefined
        if (again(tab.fields, tabName ? data[tabName] : data)) return true
      }
      continue
    }
    if (!name) {
      if (raw.fields !== undefined && again(raw.fields, data)) return true // row, collapsible
      continue
    }

    const stored = data[name]
    const perLanguage =
      raw.localized === true && isObject(stored) ? Object.values(stored) : [stored]
    for (const v of perLanguage) {
      if (v === null || v === undefined) continue
      if (raw.type === 'relationship' || raw.type === 'upload') {
        if (targetsOf(raw).includes(target) && linkPointsAt(v, target, id)) return true
      } else if (Array.isArray(raw.blocks) && Array.isArray(v)) {
        for (const row of v) {
          if (!isObject(row)) continue
          const block = (raw.blocks as unknown[])
            .map((b) =>
              typeof b === 'string' ? globalBlocks.find((g) => g.slug === b) : (b as FieldLike),
            )
            .find((b) => b?.slug === row.blockType)
          if (block && again(block.fields, row)) return true
        }
      } else if (raw.type === 'array' && Array.isArray(v)) {
        if (v.some((row) => again(raw.fields, row))) return true
      } else if (raw.fields !== undefined && isObject(v)) {
        if (again(raw.fields, v)) return true // group
      }
    }
  }
  return false
}

/** Counts, per collection, the records that still point at `id`; globals that hold it are listed too. Empty when nothing does. */
export async function findReferences(
  payload: Payload,
  target: string,
  id: string | number,
  req?: PayloadRequest,
): Promise<InUse[]> {
  const collections = payload.config.collections
  const fields = referenceFields(collections, target)
  const byCollection = new Map<string, number>()
  for (const ref of fields) {
    const config = collections.find((c) => c.slug === ref.collection)
    if (!config) continue
    const drafts = Boolean(config.versions && config.versions.drafts)
    const result = await payload.find({
      collection: ref.collection as 'pages',
      where: whereReferences(ref, target, id, id),
      draft: drafts,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
    })
    if (result.totalDocs > 0) {
      byCollection.set(
        ref.collection,
        Math.max(byCollection.get(ref.collection) ?? 0, result.totalDocs),
      )
    }
  }
  const used: InUse[] = [...byCollection].map(([collection, count]) => {
    const config = collections.find((c) => c.slug === collection)
    return { collection, count, label: config ? labelOf(config) : collection }
  })

  if (!SKIP_TARGET.has(target) && !target.startsWith('payload-')) {
    const globalBlocks = (payload.config.blocks ?? []) as unknown as FieldLike[]
    for (const g of payload.config.globals ?? []) {
      if (g.slug.startsWith('payload-')) continue
      // The live version and the newest draft: a picture in either is still in use.
      const versions = g.versions && g.versions.drafts ? [false, true] : [false]
      let found = false
      for (const draft of versions) {
        const data = await payload.findGlobal({
          slug: g.slug as 'header',
          draft,
          depth: 0,
          locale: 'all',
          overrideAccess: true,
          req,
        })
        if (dataReferences(g.fields, data, target, id, globalBlocks)) {
          found = true
          break
        }
      }
      if (found) {
        const label =
          typeof g.label === 'string'
            ? g.label
            : isObject(g.label) && typeof g.label.en === 'string'
              ? g.label.en
              : g.slug
        used.push({ collection: g.slug, count: 1, label, global: true })
      }
    }
  }
  return used
}

/** "12 People and 4 Programmes", biggest first. */
export function describeUse(used: readonly InUse[]): string {
  const parts = [...used]
    .sort((a, b) => Number(Boolean(a.global)) - Number(Boolean(b.global)) || b.count - a.count)
    .map((u) =>
      u.global ? `the ${u.label}` : `${u.count} ${u.count === 1 ? singular(u.label) : u.label}`,
    )
  if (parts.length <= 1) return parts[0] ?? ''
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

// Only used for a count of exactly one: "1 Person", not "1 People". Falls back to the plural label.
const singular = (plural: string): string =>
  (({ People: 'Person', Offices: 'Office', Campuses: 'Campus' }) as Record<string, string>)[
    plural
  ] ?? plural.replace(/ies$/, 'y').replace(/s$/, '')
