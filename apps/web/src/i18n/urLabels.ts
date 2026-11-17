/**
 * `urduLabels`: wraps English labels, descriptions, options, tab names, collection and global names
 * and menu groups as `{ en, ur }` using the dictionary in urWords.ts (slice 3r).
 *
 * It runs on the raw config, after the other plugins have added their collections and fields and
 * before Payload fills in the words it makes up from names (such as "Created At"). So, where a field
 * has no label, the English Payload would make from its name is worked out here with the same
 * function Payload uses (`toWords`, `formatLabels`) and looked up in the dictionary.
 *
 * English never changes. A string with no entry, a function, an existing `{ en, ur }` pair and
 * anything unexpected are left exactly as they are.
 */
import type { Config, Plugin } from 'payload'
import { formatLabels, toWords } from 'payload/shared'

import { URDU_WORDS } from './urWords'

type Words = Readonly<Record<string, string>>
type Loose = Record<string, unknown>

const isObject = (v: unknown): v is Loose =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** A string with an entry becomes `{ en, ur }`; anything else comes back unchanged. */
export function wrap<T>(value: T, words: Words): T | { en: string; ur: string } {
  if (typeof value !== 'string') return value
  const ur = words[value]
  return ur === undefined ? value : { en: value, ur }
}

function wrapLabels(labels: unknown, fallbackName: string, words: Words): unknown {
  const made = formatLabels(fallbackName)
  const source = isObject(labels) ? labels : {}
  const singular = source.singular ?? made.singular
  const plural = source.plural ?? made.plural
  const next = { ...source, singular: wrap(singular, words), plural: wrap(plural, words) }
  const changed = next.singular !== singular || next.plural !== plural
  return changed ? next : labels
}

function wrapOptions(options: unknown, words: Words): unknown {
  if (!Array.isArray(options)) return options
  return options.map((option) =>
    isObject(option) ? { ...option, label: wrap(option.label, words) } : option,
  )
}

function wrapFields(fields: unknown, words: Words): unknown {
  if (!Array.isArray(fields)) return fields
  return fields.map((field) => wrapField(field, words))
}

function wrapField(field: unknown, words: Words): unknown {
  if (!isObject(field)) return field
  const out: Loose = { ...field }
  const name = typeof field.name === 'string' ? field.name : undefined

  if (field.type === 'tabs' && Array.isArray(field.tabs)) {
    out.tabs = field.tabs.map((tab) => {
      if (!isObject(tab)) return tab
      const tabName = typeof tab.name === 'string' ? tab.name : undefined
      const label = tab.label ?? (tabName ? toWords(tabName) : undefined)
      return {
        ...tab,
        ...(label !== undefined ? { label: wrap(label, words) } : {}),
        ...(tab.description !== undefined ? { description: wrap(tab.description, words) } : {}),
        fields: wrapFields(tab.fields, words),
      }
    })
    return out
  }

  // A label made from the field name is worked out the way Payload does, unless the label is switched off.
  if (field.label !== false) {
    const label = field.label ?? (name ? toWords(name) : undefined)
    if (label !== undefined) out.label = wrap(label, words)
  }
  if (isObject(field.admin)) {
    const admin: Loose = { ...field.admin }
    if (admin.description !== undefined) admin.description = wrap(admin.description, words)
    if (admin.placeholder !== undefined) admin.placeholder = wrap(admin.placeholder, words)
    out.admin = admin
  }
  if (field.options !== undefined) out.options = wrapOptions(field.options, words)
  if (field.labels !== undefined || ((field.type === 'array' || field.type === 'blocks') && name)) {
    out.labels = wrapLabels(field.labels, name ?? '', words)
  }
  if (Array.isArray(field.blocks)) {
    out.blocks = field.blocks.map((block) =>
      isObject(block)
        ? {
            ...block,
            labels: wrapLabels(block.labels, String(block.slug ?? ''), words),
            fields: wrapFields(block.fields, words),
          }
        : block,
    )
  }
  if (field.fields !== undefined) out.fields = wrapFields(field.fields, words)
  return out
}

function wrapAdmin(admin: unknown, words: Words): unknown {
  if (!isObject(admin)) return admin
  const out: Loose = { ...admin }
  if (admin.group !== undefined) out.group = wrap(admin.group, words)
  if (admin.description !== undefined) out.description = wrap(admin.description, words)
  return out
}

/** Exported for tests: the transformation on its own, with a dictionary of your choosing. */
export function applyUrduLabels(config: Config, words: Words = URDU_WORDS): Config {
  return {
    ...config,
    collections: config.collections?.map((collection) => ({
      ...collection,
      labels: wrapLabels(collection.labels, collection.slug, words) as never,
      admin: wrapAdmin(collection.admin, words) as never,
      fields: wrapFields(collection.fields, words) as never,
    })),
    globals: config.globals?.map((global) => ({
      ...global,
      label: wrap(global.label ?? toWords(global.slug), words) as never,
      admin: wrapAdmin(global.admin, words) as never,
      fields: wrapFields(global.fields, words) as never,
    })),
  }
}

export const urduLabels: Plugin = (config: Config): Config => applyUrduLabels(config)
