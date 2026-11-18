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
}

/** Counts, per collection, the records that still point at `id`. Empty when nothing does. */
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
  return [...byCollection].map(([collection, count]) => {
    const config = collections.find((c) => c.slug === collection)
    return { collection, count, label: config ? labelOf(config) : collection }
  })
}

/** "12 People and 4 Programmes", biggest first. */
export function describeUse(used: readonly InUse[]): string {
  const parts = [...used]
    .sort((a, b) => b.count - a.count)
    .map((u) => `${u.count} ${u.count === 1 ? singular(u.label) : u.label}`)
  if (parts.length <= 1) return parts[0] ?? ''
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

// Only used for a count of exactly one: "1 Person", not "1 People". Falls back to the plural label.
const singular = (plural: string): string =>
  (({ People: 'Person', Offices: 'Office', Campuses: 'Campus' }) as Record<string, string>)[
    plural
  ] ?? plural.replace(/ies$/, 'y').replace(/s$/, '')
