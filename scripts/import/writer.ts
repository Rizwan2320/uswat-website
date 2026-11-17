/**
 * Applies a plan through the CMS Local API. The CMS handle is passed in, so this file imports nothing
 * from Payload and the plan stays testable without a database. The importer acts as the system (no
 * user), so the governance hooks run: origin and sourceContentHash are accepted from it, and every
 * record is a draft.
 */
import { legacyKey } from '../../apps/web/src/legacy/routeMap'

import { ARTICLE_COLLECTIONS, DEFAULT_COLLECTED_AT, type ArticleCollection } from './contract'
import type { Decision, Existing, MappedDoc } from './plan'

type Args = Record<string, unknown>
export interface Cms {
  find(args: Args): Promise<{ docs: Record<string, unknown>[]; hasNextPage: boolean }>
  create(args: Args): Promise<{ id: number | string }>
  update(args: Args): Promise<{ id: number | string }>
}

const CONTEXT = { disableRevalidate: true }

/** Local database only. A Neon or Vercel host is refused even if the name also says localhost. */
export function assertLocalDatabase(url: string | undefined): void {
  if (!url) throw new Error('DATABASE_URL is not set')
  let host = ''
  try {
    host = new URL(url).hostname.toLowerCase()
  } catch {
    throw new Error('DATABASE_URL is not a valid address')
  }
  if (/neon|vercel|supabase|amazonaws/.test(url.toLowerCase()))
    throw new Error('Refusing to write: DATABASE_URL looks like a hosted database')
  if (!['localhost', '127.0.0.1', '::1', '[::1]', ''].includes(host))
    throw new Error(`Refusing to write: database host "${host}" is not this machine`)
}

export function textToLexical(text: string) {
  const paragraph = (t: string) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    textFormat: 0,
    children: [{ type: 'text', version: 1, text: t, format: 0, detail: 0, mode: 'normal', style: '' }],
  })
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children: paras.map(paragraph) } }
}

/** What is already stored for each key, one collection at a time (latest saved state, drafts included). */
export async function loadExisting(cms: Cms, slugs: ArticleCollection[]): Promise<Map<string, Existing>> {
  const out = new Map<string, Existing>()
  for (const collection of slugs) {
    for (let page = 1; ; page++) {
      const res = await cms.find({ collection, draft: true, depth: 0, limit: 500, page, overrideAccess: true })
      for (const doc of res.docs) {
        const g = (doc.governance ?? {}) as Record<string, string | null | undefined>
        if (!g.source) continue
        out.set(legacyKey(g.source), {
          id: doc.id as number | string,
          sourceContentHash: g.sourceContentHash ?? null,
          origin: g.origin ?? null,
          verification: g.verificationStatus ?? null,
          status: g.status ?? null,
        })
      }
      if (!res.hasNextPage) break
    }
  }
  return out
}

async function tagIds(cms: Cms, names: string[], cache: Map<string, number | string>): Promise<(number | string)[]> {
  const ids: (number | string)[] = []
  for (const name of names) {
    let id = cache.get(name)
    if (id == null) {
      const found = await cms.find({ collection: 'article-tags', draft: true, depth: 0, limit: 1, where: { name: { equals: name } }, overrideAccess: true })
      id =
        (found.docs[0]?.id as number | string | undefined) ??
        (
          await cms.create({
            collection: 'article-tags',
            draft: true,
            overrideAccess: true,
            context: CONTEXT,
            data: { name, governance: { origin: 'importer', source: 'old site category', collectedAt: DEFAULT_COLLECTED_AT } },
          })
        ).id
      cache.set(name, id)
    }
    ids.push(id)
  }
  return ids
}

/**
 * News is the `posts` collection: its body field is `content`, and it has no excerpt, attachments or
 * legacyUrl field (P3 lane), so those are not stored for News. The key is governance.source either way.
 */
export function toCmsData(slug: ArticleCollection, doc: MappedDoc, tags: (number | string)[]) {
  const body = doc.text ? textToLexical(doc.text) : undefined
  const common = {
    title: doc.title,
    slug: doc.slug,
    bodyStatus: doc.bodyStatus,
    ...(doc.publishedAt ? { publishedAt: doc.publishedAt } : {}),
    tags,
    governance: doc.governance,
  }
  return slug === 'posts'
    ? { ...common, ...(body ? { content: body } : {}) }
    : {
        ...common,
        legacyUrl: doc.governance.source,
        ...(doc.excerpt ? { excerpt: doc.excerpt } : {}),
        ...(body ? { body } : {}),
        attachments: doc.attachments,
      }
}

export type Applied = { created: number; updated: number }

export async function applyDecisions(cms: Cms, decisions: Decision[]): Promise<Applied> {
  const cache = new Map<string, number | string>()
  const applied: Applied = { created: 0, updated: 0 }
  for (const d of decisions) {
    if ((d.outcome !== 'create' && d.outcome !== 'update') || !d.doc || !d.collection) continue
    const data = toCmsData(d.collection, d.doc, await tagIds(cms, d.doc.tagNames, cache))
    if (d.outcome === 'create') {
      await cms.create({ collection: d.collection, draft: true, overrideAccess: true, context: CONTEXT, data })
      applied.created++
    } else {
      await cms.update({ collection: d.collection, id: d.existingId, draft: true, overrideAccess: true, context: CONTEXT, data })
      applied.updated++
    }
  }
  return applied
}

export const articleSlugs = (): ArticleCollection[] => Object.values(ARTICLE_COLLECTIONS)
