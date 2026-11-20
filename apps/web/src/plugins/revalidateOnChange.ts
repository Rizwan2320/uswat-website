/**
 * Refreshes the public site when governed content changes (slice 3w, docs/briefs/p3w-revalidation.md).
 *
 * The public pages cache their lists for a few minutes under the tags `list:{type}` and read one
 * record under `item:{type}:{id}`. Before this, only Pages, Posts, the globals and Redirects told the
 * site to refresh; a published notice or an archived job could take minutes to show. This adds one
 * `afterChange` and one `afterDelete` hook to every collection that has the `governance` group, so a
 * new governed collection is covered without anyone remembering.
 *
 * It refreshes only when it matters: the record is live now, or was live before this save (so an
 * unpublish and a delete of a live record count, a draft autosave does not). The lifecycle sweep
 * publishes through the Local API, so it runs these hooks; it archives and marks stale by writing to
 * the database directly (on purpose, to skip the workflow), so it calls `refreshPublic` itself.
 *
 * A failed refresh never fails a save. `context.disableRevalidate` switches it off (importer, seeds,
 * tests), as for Pages and Posts.
 */
import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Config,
  Plugin,
} from 'payload'

/** The site calls the posts collection "news" (src/site/articles/config.ts). */
const TYPE_NAME: Record<string, string> = { posts: 'news' }
export const typeName = (slug: string): string => TYPE_NAME[slug] ?? slug

/** The tags to refresh for one record. */
export const tagsFor = (slug: string, id: string | number | undefined): string[] => {
  const type = typeName(slug)
  return [
    `list:${type}`,
    ...(id === undefined || id === null ? [] : [`item:${type}:${id}`]),
    'content-sitemap',
  ]
}

type Versioned = { _status?: string | null } | null | undefined

/**
 * Pure. Is this change visible to the public? Live now or live before. A collection with no draft
 * stage (no `_status`) is always live.
 */
export function affectsPublic(doc: Versioned, previousDoc: Versioned): boolean {
  const hasStages = (doc && '_status' in doc) || (previousDoc && '_status' in previousDoc)
  if (!hasStages) return true
  return doc?._status === 'published' || previousDoc?._status === 'published'
}

export const hasGovernance = (c: Pick<CollectionConfig, 'fields'>): boolean =>
  c.fields.some((f) => f.type === 'group' && 'name' in f && f.name === 'governance')

/** Tells the public site to refresh one record's lists and page. Never throws. */
export function refreshPublic(
  slug: string,
  id: string | number | undefined,
  log: { warn: (o: unknown, m: string) => void },
): void {
  try {
    for (const tag of tagsFor(slug, id)) revalidateTag(tag, 'max')
  } catch (error) {
    // Outside a Next request (a script) there is nothing to refresh. Never fail the save for this.
    log.warn({ err: error, collection: slug }, 'Could not refresh the public site cache')
  }
}

export const revalidateOnChange =
  (slug: string): CollectionAfterChangeHook =>
  ({ doc, previousDoc, req: { payload, context } }) => {
    if (!context.disableRevalidate && affectsPublic(doc, previousDoc)) refreshPublic(slug, doc?.id, payload.logger)
    return doc
  }

export const revalidateOnDelete =
  (slug: string): CollectionAfterDeleteHook =>
  ({ doc, id, req: { payload, context } }) => {
    if (!context.disableRevalidate && affectsPublic(doc, doc)) refreshPublic(slug, id ?? doc?.id, payload.logger)
    return doc
  }

export const revalidateGoverned: Plugin = (config: Config): Config => ({
  ...config,
  collections: config.collections?.map((c) =>
    hasGovernance(c)
      ? {
          ...c,
          hooks: {
            ...c.hooks,
            afterChange: [...(c.hooks?.afterChange ?? []), revalidateOnChange(c.slug)],
            afterDelete: [...(c.hooks?.afterDelete ?? []), revalidateOnDelete(c.slug)],
          },
        }
      : c,
  ),
})
