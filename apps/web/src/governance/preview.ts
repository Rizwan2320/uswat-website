import type { DataFromCollectionSlug, Payload } from 'payload'

import type { User } from '@/payload-types'

export type PreviewReadOptions = {
  /** Read the newest draft instead of the live version. Only true for a signed-in person. */
  draft: boolean
  /** Always false: a draft is read with the person's own access, never as the system. */
  overrideAccess: false
  user?: User
}

/**
 * Options for a public page's `payload.find` when Next draft mode may be on.
 *
 * The template read drafts with `overrideAccess: draft`, which meant anyone holding the draft-mode
 * cookie saw the newest draft of any page: staff of another office, and a person who had since
 * logged out (the cookie outlives the login). Here the draft-mode cookie only says "the person
 * asked for a preview". Who they are comes from the login on THIS request, and the collection's
 * own read rules decide what they get. With no login, or an expired one, they get the live page.
 */
export async function previewReadOptions(
  payload: Payload,
  draftModeOn: boolean,
  headers: Headers,
): Promise<PreviewReadOptions> {
  if (!draftModeOn) return { draft: false, overrideAccess: false }
  try {
    const { user } = await payload.auth({ headers })
    if (user) return { draft: true, overrideAccess: false, user: user as User }
  } catch {
    // A bad or expired token is the same as no login.
  }
  return { draft: false, overrideAccess: false }
}

/**
 * The document a public page should show for this request, found by slug.
 *
 * With a valid login and draft mode on, it is the newest draft the person is allowed to read.
 * When they may not read that draft (another office's page, say), or there is none, they get the
 * live page exactly as the public does, so turning preview on never makes a page disappear.
 */
export async function findForPreview<C extends 'pages' | 'posts'>(
  payload: Payload,
  collection: C,
  args: { slug: string; draftModeOn: boolean; headers: Headers; depth?: number },
): Promise<DataFromCollectionSlug<C> | null> {
  const where = { slug: { equals: args.slug } }
  const read = await previewReadOptions(payload, args.draftModeOn, args.headers)
  if (read.draft) {
    const draft = await payload.find({
      collection,
      limit: 1,
      pagination: false,
      where,
      depth: args.depth,
      ...read,
    })
    if (draft.docs[0]) return draft.docs[0] as DataFromCollectionSlug<C>
  }
  const live = await payload.find({
    collection,
    draft: false,
    limit: 1,
    pagination: false,
    overrideAccess: false,
    where,
    depth: args.depth,
  })
  return (live.docs[0] as DataFromCollectionSlug<C> | undefined) ?? null
}
