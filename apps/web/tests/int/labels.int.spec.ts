// @vitest-environment node
/**
 * Plain-language guard for the admin. Office staff read these labels, not developers.
 * It fails when a field an editor can see has no written label, uses developer words,
 * repeats a sibling's label, or has a select option shown as a raw code like "in_review".
 */
import type { Field, Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload } from '../helpers/governance'

// Provided by plugins or Payload itself; their wording is not ours to set.
const SKIP_COLLECTIONS = new Set([
  'search',
  'redirects',
  'forms',
  'form-submissions',
  'payload-kv',
  'payload-jobs',
  'payload-folders',
  'payload-locked-documents',
  'payload-preferences',
  'payload-migrations',
])
// Fields the admin never shows as a form input (login internals, ids, timestamps).
const NEVER_SHOWN = new Set(['id', 'createdAt', 'updatedAt', 'folder', '_status'])
const AUTH_INTERNALS = new Set([
  'resetPasswordToken',
  'resetPasswordExpiration',
  'salt',
  'hash',
  'loginAttempts',
  'lockUntil',
  'sessions',
  'resetPasswordRequestedAt',
])
// Page-builder internals the main agent owns and editors reach only through the layout blocks.
const TEMPLATE_INTERNALS = new Set(['populatedAuthors', 'breadcrumbs', 'generateSlug'])

// Payload supplies these with its own translated label.
const PROVIDED = new Set(['users.email'])

const JARGON =
  /\b(slug|url|uri|hash|sha-?\d*|uuid|json|boolean|enum|populate|payload|hero|meta|ids?)\b/i

type Row = {
  where: string
  label: string | undefined
  options?: { label: string; value: string }[]
}

function visible(f: Field): boolean {
  const admin = (f as { admin?: { hidden?: boolean; disabled?: boolean } }).admin
  return !(admin?.hidden || admin?.disabled)
}

function collect(fields: Field[], where: string, out: Row[], problems: string[]): void {
  const seen = new Map<string, string>()
  for (const f of fields) {
    if (f.type === 'tabs') {
      for (const tab of f.tabs)
        collect(tab.fields, `${where}${'name' in tab ? tab.name + '.' : ''}`, out, problems)
      continue
    }
    const name = 'name' in f && f.name ? f.name : undefined
    const nested = 'fields' in f ? (f.fields as Field[]) : undefined
    if (f.type === 'row' || f.type === 'collapsible') {
      if (nested) collect(nested, where, out, problems)
      continue
    }
    if (!name || NEVER_SHOWN.has(name) || AUTH_INTERNALS.has(name) || TEMPLATE_INTERNALS.has(name))
      continue
    if (!visible(f)) continue
    const path = `${where}${name}`
    if (PROVIDED.has(path)) continue
    const raw = (f as { label?: unknown }).label
    if (raw === false) {
      // Deliberately unlabelled (a rich-text body inside a block): its parent is labelled.
    } else if (typeof raw !== 'string') {
      problems.push(`${path}: no written label`)
    } else {
      if (JARGON.test(raw)) problems.push(`${path}: label "${raw}" uses a developer word`)
      const key = raw.trim().toLowerCase()
      const clash = seen.get(key)
      if (clash) problems.push(`${path}: label "${raw}" repeats ${clash}`)
      else seen.set(key, path)
    }
    const options = (f as { options?: unknown }).options
    if (f.type === 'select' && Array.isArray(options)) {
      for (const o of options) {
        const opt =
          typeof o === 'string' ? { label: o, value: o } : (o as { label: unknown; value: string })
        const label = typeof opt.label === 'string' ? opt.label : ''
        if (!label) problems.push(`${path}: option "${opt.value}" has no label`)
        else if (
          /_/.test(label) ||
          (label === opt.value &&
            /[a-z][A-Z_]|^[a-z]+$/.test(label) &&
            label[0] === label[0].toLowerCase())
        )
          problems.push(`${path}: option shows the code "${label}"`)
      }
    }
    if (nested) collect(nested, `${path}.`, out, problems)
    const blocks = (f as { blocks?: { slug: string; fields: Field[] }[] }).blocks
    if (blocks) for (const b of blocks) collect(b.fields, `${path}[${b.slug}].`, out, problems)
  }
}

let payload: Payload

describe('admin wording', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it('every field an editor can see has a plain-language label', () => {
    const problems: string[] = []
    for (const c of payload.config.collections) {
      if (SKIP_COLLECTIONS.has(c.slug)) continue
      collect(c.fields as Field[], `${c.slug}.`, [], problems)
    }
    expect(problems).toEqual([])
  })

  it('collections an editor opens sit under a named menu group', () => {
    const loose = payload.config.collections
      .filter((c) => !SKIP_COLLECTIONS.has(c.slug) && !c.admin?.hidden && !c.admin?.group)
      .map((c) => c.slug)
    expect(loose).toEqual([])
  })

  it('the internal fingerprint fields are not shown in the form', () => {
    const col = payload.collections.notices.config
    const gov = col.fields.find((f) => 'name' in f && f.name === 'governance') as {
      fields: { name: string; admin?: { hidden?: boolean } }[]
    }
    for (const n of ['contentHash', 'sourceContentHash']) {
      expect(gov.fields.find((f) => f.name === n)?.admin?.hidden).toBe(true)
    }
  })
})
