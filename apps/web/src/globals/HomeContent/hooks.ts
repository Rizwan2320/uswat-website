import { revalidatePath, revalidateTag } from 'next/cache'
import {
  APIError,
  type GlobalAfterChangeHook,
  type GlobalBeforeChangeHook,
  type GlobalBeforeOperationHook,
} from 'payload'

import { mayPublishHome, slideImageIds, slideMediaProblems } from '../../governance/homeContent'
import { actorFromRequest } from '../../governance/roles'

/** The cache tag the site's home getter must carry (the contract with the main agent). */
export const HOME_TAG = 'global_home-content'

const publishForbidden = () =>
  new APIError(
    'Only an approver, site manager or platform admin can publish the home page content. Save it as a draft and ask an approver.',
    403,
    { code: 'HOME_PUBLISH_FORBIDDEN' },
    true,
  )

/**
 * Restoring an old version puts it live, and Payload runs no `beforeChange` hook for that. So the same
 * rule is applied here: only a reviewer may restore a version as the live one; "restore as draft" is
 * open to anyone who may edit (found in exploration, prediction P3z-d).
 */
export const homeBeforeOperation: GlobalBeforeOperationHook = ({ args, operation, req }) => {
  if (operation === 'restoreVersion' && !(args as { draft?: boolean }).draft) {
    if (!mayPublishHome(actorFromRequest(req))) throw publishForbidden()
  }
  return args
}

/** Publishing is for reviewers; the pictures must be fit for a live page. Drafts pass freely. */
export const homeBeforeChange: GlobalBeforeChangeHook = async ({ data, req }) => {
  if (data?._status !== 'published') return data

  if (!mayPublishHome(actorFromRequest(req))) throw publishForbidden()

  const ids = slideImageIds(data.slides)
  const unique = [...new Set(ids.filter((id): id is string | number => id != null))]
  const media = new Map<string | number, Record<string, unknown> | null>()
  for (const id of unique) {
    try {
      media.set(
        id,
        (await req.payload.findByID({
          collection: 'media',
          id,
          depth: 0,
          overrideAccess: true,
          req,
        })) as unknown as Record<string, unknown>,
      )
    } catch {
      media.set(id, null)
    }
  }
  const problems = slideMediaProblems(ids, media)
  if (problems.length > 0) {
    throw new APIError(
      `The home page content cannot be published yet. ${problems.map((p) => p.message).join(' ')}`,
      400,
      { code: 'HOME_MEDIA_PROBLEM', problems: problems.map((p) => p.code) },
      true,
    )
  }
  return data
}

/** Tell the public home page. Never blocks a save: a failed refresh falls back to the time bound. */
export function refreshHome(log: { error: (o: unknown, m?: string) => void }): void {
  try {
    revalidateTag(HOME_TAG, 'max')
    revalidatePath('/')
  } catch (err) {
    log.error({ err }, 'Could not refresh the home page after a change')
  }
}

export const homeAfterChange: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) refreshHome(payload.logger)
  return doc
}
