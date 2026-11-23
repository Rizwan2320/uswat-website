import { describe, expect, it } from 'vitest'

import { profileState } from '@/modules/portal/homeState'

const base = { status: 'none' as const, reviewNote: null, selfPublishing: false, draftIsPublished: false, published: null }

describe('home profile state', () => {
  it('a person with nothing saved has not started', () => {
    expect(profileState(base)).toBe('not-started')
  })
  it('a saved draft, a submission, and a returned draft are told apart', () => {
    expect(profileState({ ...base, status: 'draft' })).toBe('saved-draft')
    expect(profileState({ ...base, status: 'submitted' })).toBe('with-reviewer')
    expect(profileState({ ...base, status: 'draft', reviewNote: 'Please shorten the bio.' })).toBe('changes-requested')
  })
  it('a draft equal to what is published reads as published', () => {
    expect(profileState({ ...base, status: 'draft', draftIsPublished: true, published: {} as never })).toBe('published')
  })
  it('a head or the Registrar is never "with a reviewer": saved changes are unpublished until they publish', () => {
    const self = { ...base, selfPublishing: true }
    expect(profileState(self)).toBe('not-started')
    expect(profileState({ ...self, status: 'draft' })).toBe('unpublished-self')
    expect(profileState({ ...self, status: 'submitted' })).toBe('unpublished-self')
    expect(profileState({ ...self, status: 'draft', draftIsPublished: true, published: {} as never })).toBe('published')
  })
})
