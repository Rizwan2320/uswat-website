import { describe, expect, it } from 'vitest'

import {
  HOME_EDIT_ROLES,
  HOME_PUBLISH_ROLES,
  isHomeHref,
  mayPublishHome,
  slideImageIds,
  slideMediaProblems,
} from '../../src/governance/homeContent'
import type { Actor } from '../../src/governance/roles'

const user = (role: string): Actor => ({ kind: 'user', id: 1, role, offices: [] }) as Actor

describe('home page links', () => {
  it.each([
    ['/academics', true],
    ['/campuses/main', true],
    ['/', true],
    ['https://uswat.edu.pk/oric-2/', true],
    ['  https://example.test/x  ', true],
    ['javascript:alert(1)', false],
    ['JaVaScRiPt:alert(1)', false],
    ['data:text/html,<b>x</b>', false],
    ['vbscript:x', false],
    ['http://www.digitallibrary.edu.pk/uniofswat.html', false],
    ['//evil.test/x', false],
    ['/\\evil.test', false],
    ['mailto:a@example.test', false],
    ['tel:+920000000', false],
    ['#top', false],
    ['https://', false],
    ['academics', false],
    ['', false],
    ['   ', false],
    ['https://exa\tmple.test', false],
    [null, false],
    [undefined, false],
    [42, false],
  ])('%j is %s', (value, ok) => {
    expect(isHomeHref(value)).toBe(ok)
  })
})

describe('who may publish the home content', () => {
  it('approver, site manager, platform admin and trusted server code; not an editor', () => {
    for (const role of HOME_PUBLISH_ROLES) expect(mayPublishHome(user(role)), role).toBe(true)
    expect(mayPublishHome({ kind: 'system' })).toBe(true)
    for (const role of ['editor', 'contributor', 'auditor'])
      expect(mayPublishHome(user(role)), role).toBe(false)
    expect(mayPublishHome({ kind: 'anonymous' })).toBe(false)
  })
  it('an editor may save drafts, a contributor or auditor may not edit at all', () => {
    expect([...HOME_EDIT_ROLES].sort()).toEqual([
      'approver',
      'editor',
      'platformAdmin',
      'siteManager',
    ])
  })
})

describe('slide pictures', () => {
  it('reads the id from an id or a populated record, in slide order, keeping gaps', () => {
    expect(slideImageIds([{ image: 4 }, { image: { id: 7 } }, {}, { image: null }])).toEqual([
      4,
      7,
      null,
      null,
    ])
    expect(slideImageIds(undefined)).toEqual([])
  })

  const media = new Map<
    string | number,
    { filename?: string; alt?: string; rightsStatus?: string } | null
  >([
    [1, { filename: 'a.jpg', alt: 'A hall', rightsStatus: 'owned' }],
    [2, { filename: 'b.jpg', alt: '', rightsStatus: 'owned' }],
    [3, { filename: 'c.jpg', alt: 'A lawn', rightsStatus: 'unknown' }],
    [4, null],
  ])

  it('accepts a picture with alt text and recorded rights', () => {
    expect(slideMediaProblems([1], media)).toEqual([])
  })
  it('names the slide and the problem, and each kind has its own code', () => {
    const out = slideMediaProblems([1, 2, 3, 4, null, 99], media)
    expect(out.map((p) => p.code)).toEqual([
      'HOME_MEDIA_ALT',
      'HOME_MEDIA_RIGHTS',
      'HOME_MEDIA_MISSING',
      'HOME_MEDIA_MISSING',
      'HOME_MEDIA_MISSING',
    ])
    expect(out[0]!.message).toMatch(/slide 2 \(b\.jpg\) has no alt text/)
    expect(out[1]!.message).toMatch(/slide 3 \(c\.jpg\) has no recorded rights/)
    expect(out[2]!.message).toMatch(/Slide 4 has no picture/)
  })
})
