import { describe, expect, it } from 'vitest'

import {
  firstHeadingSkip,
  isBareLinkText,
  lexicalFindings,
} from '../../src/governance/accessibility'
import { publishProblems, scanFields } from '../../src/governance/mediaGuard'
import {
  checkMediaWrite,
  mediaPublishProblem,
  MEDIA_MAX_BYTES,
} from '../../src/governance/mediaRules'
import type { Actor } from '../../src/governance/roles'

const text = (t: string) => ({ type: 'text', text: t })
const heading = (tag: string, t = 'H') => ({ type: 'heading', tag, children: [text(t)] })
const link = (t: string) => ({ type: 'link', children: [text(t)] })
const doc = (...children: unknown[]) => ({ root: { type: 'root', children } })

describe('lexicalFindings', () => {
  it('collects headings, link text and uploads in order', () => {
    const f = lexicalFindings(
      doc(
        heading('h2'),
        { type: 'paragraph', children: [text('See '), link('the fee schedule'), text('.')] },
        heading('h3'),
        { type: 'upload', relationTo: 'media', value: 7 },
      ),
    )
    expect(f.headings).toEqual([2, 3])
    expect(f.links).toEqual(['the fee schedule'])
    expect(f.uploads).toEqual([{ relationTo: 'media', value: 7 }])
  })
  it('joins text split across nodes and ignores empty or odd input', () => {
    expect(
      lexicalFindings(doc({ type: 'link', children: [text('click '), text('here')] })).links,
    ).toEqual(['click here'])
    expect(lexicalFindings(null).headings).toEqual([])
    expect(lexicalFindings('x').links).toEqual([])
  })
})

describe('firstHeadingSkip', () => {
  it('allows H2 first and one level at a time, in any order going up', () => {
    expect(firstHeadingSkip([2, 3, 4, 2, 3, 2])).toBeNull()
    expect(firstHeadingSkip([])).toBeNull()
  })
  it('flags a jump', () => {
    expect(firstHeadingSkip([2, 4])).toEqual({ at: 2, from: 2, to: 4 })
    expect(firstHeadingSkip([3])).toEqual({ at: 1, from: 1, to: 3 })
  })
})

describe('isBareLinkText', () => {
  it.each(['click here', 'Click Here', ' here ', 'Here.', 'this link', 'link', 'click'])(
    'flags %j',
    (t) => expect(isBareLinkText(t)).toBe(true),
  )
  it.each(['Read the fee schedule', 'here is the form', 'Download the prospectus', ''])(
    'allows %j',
    (t) => expect(isBareLinkText(t)).toBe(false),
  )
})

const user = (role: string): Actor => ({ kind: 'user', id: 1, role: role as never, offices: [] })
const png = { size: 1000, mimetype: 'image/png' }
const base = {
  operation: 'create' as const,
  alt: 'A lecture hall',
  altTouched: true,
  rights: 'unknown',
  rightsChanged: false,
  file: png,
}

describe('checkMediaWrite', () => {
  it('requires alt from a person on create, and when a person edits alt', () => {
    expect(checkMediaWrite({ ...base, actor: user('editor'), alt: '  ' })).toMatchObject({
      code: 'ALT_REQUIRED',
    })
    expect(
      checkMediaWrite({
        ...base,
        actor: user('approver'),
        operation: 'update',
        alt: '',
        file: null,
      }),
    ).toMatchObject({ code: 'ALT_REQUIRED' })
  })
  it('lets the system create without alt, and leaves an untouched empty alt alone on update', () => {
    expect(checkMediaWrite({ ...base, actor: { kind: 'system' }, alt: '' })).toEqual({ ok: true })
    expect(
      checkMediaWrite({
        ...base,
        actor: user('approver'),
        operation: 'update',
        alt: '',
        altTouched: false,
        file: null,
      }),
    ).toEqual({ ok: true })
  })
  it('refuses non-image types (SVG included) and files over the limit', () => {
    for (const mimetype of ['image/svg+xml', 'application/pdf', 'text/html', '']) {
      expect(
        checkMediaWrite({ ...base, actor: user('editor'), file: { size: 10, mimetype } }),
      ).toMatchObject({ code: 'MEDIA_TYPE_NOT_ALLOWED' })
    }
    expect(
      checkMediaWrite({
        ...base,
        actor: user('editor'),
        file: { size: MEDIA_MAX_BYTES + 1, mimetype: 'image/png' },
      }),
    ).toMatchObject({ code: 'MEDIA_TOO_LARGE', httpStatus: 413 })
    expect(
      checkMediaWrite({
        ...base,
        actor: user('editor'),
        file: { size: MEDIA_MAX_BYTES, mimetype: 'image/webp' },
      }),
    ).toEqual({ ok: true })
  })
  it('lets only reviewers record rights', () => {
    const set = { ...base, rights: 'owned', rightsChanged: true }
    expect(checkMediaWrite({ ...set, actor: user('editor') })).toMatchObject({
      code: 'RIGHTS_REVIEWER_ONLY',
    })
    expect(checkMediaWrite({ ...set, actor: user('contributor') })).toMatchObject({
      code: 'RIGHTS_REVIEWER_ONLY',
    })
    for (const role of ['approver', 'siteManager', 'platformAdmin']) {
      expect(checkMediaWrite({ ...set, actor: user(role) })).toEqual({ ok: true })
    }
    expect(checkMediaWrite({ ...set, actor: { kind: 'system' } })).toEqual({ ok: true })
  })
})

describe('mediaPublishProblem', () => {
  it('blocks empty alt and unknown rights; passes the rest', () => {
    expect(mediaPublishProblem({ alt: '', rightsStatus: 'owned' })?.code).toBe('MEDIA_ALT_MISSING')
    expect(mediaPublishProblem({ alt: 'x' })?.code).toBe('MEDIA_RIGHTS_UNKNOWN')
    expect(mediaPublishProblem({ alt: 'x', rightsStatus: 'unknown' })?.code).toBe(
      'MEDIA_RIGHTS_UNKNOWN',
    )
    for (const r of ['owned', 'permission_granted', 'licensed', 'permission_pending']) {
      expect(mediaPublishProblem({ alt: 'x', rightsStatus: r })).toBeNull()
    }
  })
})

describe('scanFields', () => {
  const body = doc(heading('h2'), heading('h4'), {
    type: 'paragraph',
    children: [link('click here'), { type: 'upload', relationTo: 'media', value: { id: 9 } }],
  })
  const fields = [
    { name: 'hero', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText' },
    {
      type: 'row',
      fields: [{ name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true }],
    },
    {
      name: 'meta',
      type: 'group',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
    },
    {
      type: 'tabs',
      tabs: [
        { name: 'seo', fields: [{ name: 'og', type: 'upload', relationTo: 'media' }] },
        { label: 'Loose', fields: [{ name: 'extra', type: 'upload', relationTo: 'media' }] },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      fields: [{ name: 'pic', type: 'upload', relationTo: 'media' }],
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        {
          slug: 'cta',
          fields: [
            { name: 'text', type: 'richText' },
            { name: 'link', type: 'group', fields: [{ name: 'label', type: 'text' }] },
          ],
        },
      ],
    },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ] as never
  const data = {
    hero: 1,
    body,
    gallery: [2, { id: 3 }],
    meta: { image: 4 },
    seo: { og: 5 },
    extra: 6,
    rows: [{ pic: 7 }, { pic: 8 }],
    layout: [
      { blockType: 'cta', text: doc(heading('h3')), link: { label: 'Here' } },
      { blockType: 'unknown', hero: 99 },
    ],
    author: 1,
  }

  it('finds media in every container type, and rich text and link labels', () => {
    const scan = { mediaIds: new Set<string | number>(), richTexts: [], linkLabels: [] } as never
    scanFields(fields, data, scan, '', [])
    const s = scan as {
      mediaIds: Set<number>
      richTexts: { path: string }[]
      linkLabels: unknown[]
    }
    expect([...s.mediaIds].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(s.richTexts.map((r) => r.path)).toEqual(['body', 'layout[0].text'])
    expect(s.linkLabels).toEqual([{ path: 'layout[0].link.label', label: 'Here' }])
  })

  it('turns the findings into named problems', () => {
    const scan = { mediaIds: new Set<string | number>(), richTexts: [], linkLabels: [] } as never
    scanFields(fields, data, scan, '', [])
    const problems = publishProblems(scan, [
      { id: 1, alt: '', rightsStatus: 'owned', filename: 'a.png' },
      { id: 2, alt: 'ok', rightsStatus: 'unknown' },
      { id: 3, alt: 'ok', rightsStatus: 'licensed' },
    ])
    expect(problems.map((p) => p.code)).toEqual([
      'MEDIA_ALT_MISSING',
      'MEDIA_RIGHTS_UNKNOWN',
      'HEADING_LEVEL_SKIPPED',
      'LINK_TEXT_BARE',
      'LINK_TEXT_BARE',
    ])
    expect(problems[2].message).toContain('"body"')
    expect(problems[0].message).toContain('a.png')
  })

  it('judges headings across fields: a later block may start at H3 under an earlier H2', () => {
    const rt = (path: string, ...h: number[]) => ({
      path,
      findings: { headings: h, links: [], uploads: [] },
    })
    expect(publishProblems({ richTexts: [rt('a', 2), rt('b', 3, 3)], linkLabels: [] }, [])).toEqual(
      [],
    )
    const p = publishProblems({ richTexts: [rt('a', 2), rt('b', 4)], linkLabels: [] }, [])
    expect(p.map((x) => x.code)).toEqual(['HEADING_LEVEL_SKIPPED'])
    expect(p[0].message).toContain('"b"')
  })
})
