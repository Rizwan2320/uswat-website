/**
 * What the home page says about the person's own profile, as one pure function of what the store loaded.
 * Words come from COPY.home.state; this decides which one. Tested directly.
 */
import type { LoadedProfile } from './profile/types'

export type ProfileState = 'not-started' | 'changes-requested' | 'with-reviewer' | 'saved-draft' | 'unpublished-self' | 'published'

export function profileState(l: Pick<LoadedProfile, 'status' | 'reviewNote' | 'selfPublishing' | 'draftIsPublished' | 'published'>): ProfileState {
  if (l.selfPublishing) {
    if (l.status === 'none' && l.published === null) return 'not-started'
    return l.draftIsPublished ? 'published' : 'unpublished-self'
  }
  if (l.status === 'submitted') return 'with-reviewer'
  if (l.status === 'draft') {
    if (l.reviewNote) return 'changes-requested'
    return l.draftIsPublished ? 'published' : 'saved-draft'
  }
  return l.published === null ? 'not-started' : 'published'
}
