/**
 * Sample News, Notices, Events, Jobs, Tenders, article tags and merit lists in every state an editor, an approver and
 * an admin need to walk through (brief a4-sample-content-pack). Everything is invented and says so: titles start with
 * "Sample", dates are relative to the seed run, attachments point at sample.invalid, and Urdu text is a marked draft.
 */
import type { Cms } from '../writer'
import { textToLexical } from '../writer'

import { SAMPLE_OWNER_OFFICE, sampleSource } from './data'
import type { SeedActor } from './apply'
import { addResults, emptyResult, loadBySource, seedRecord, type FlowResult, type SeedState } from './flow'
import { PDF_ADDRESS, placeholderImages } from './placeholders'

type Coll = 'posts' | 'notices' | 'events' | 'jobs' | 'tenders'
type Role = 'current' | 'attachment' | 'closed' | 'long' | 'today' | 'draft-1' | 'draft-2' | 'review-1' | 'review-2'

export const ARTICLE_COLLECTIONS: Coll[] = ['posts', 'notices', 'events', 'jobs', 'tenders']
export const URDU_DRAFT_NOTE = 'مسودہ ترجمہ: ماہرِ زبان سے جائزہ باقی ہے۔'

export type TagSeed = { slug: string; name: string }
export const tags: TagSeed[] = [
  { slug: 'sample-admissions', name: 'Sample Admissions' },
  { slug: 'sample-examinations', name: 'Sample Examinations' },
  { slug: 'sample-research', name: 'Sample Research' },
  { slug: 'sample-campus-life', name: 'Sample Campus Life' },
  { slug: 'sample-careers', name: 'Sample Careers' },
]

/** Department tags: the tag's slug equals the department's slug, and the department page lists what is tagged (site/academics/feed.ts). */
export const departmentTags: TagSeed[] = [{ slug: 'dcst', name: 'DCST' }]

export type ArticleSeed = {
  collection: Coll
  slug: string
  role: Role
  title: string
  excerpt: string
  body: string
  state: SeedState
  tags: string[]
  /** Days from the seed run (negative = in the past). */
  publishedDays: number
  /** Events: when it starts, in days from now (can be fractional: 0.04 is about an hour). */
  startsDays?: number
  /** Jobs, Tenders, Notices, News: when it closes, in days from now (negative = closed). */
  closesDays?: number
  attachment?: string
  urdu?: { title: string; excerpt: string; body: string }
}

const LONG =
  ' with a deliberately very long title that runs on and on, to test how headings wrap in lists, cards, breadcrumbs, feeds and search results on narrow screens and in both directions'

type Spec = {
  collection: Coll
  noun: string
  tag: string
  urdu: { title: string; excerpt: string }
  expiry: 'none' | 'closes' | 'event'
}
const SPECS: Spec[] = [
  { collection: 'posts', noun: 'news story', tag: 'sample-campus-life', urdu: { title: 'نمونہ خبر: کیمپس میں نئی سرگرمی', excerpt: 'یہ ایک فرضی خبر ہے۔' }, expiry: 'none' },
  { collection: 'notices', noun: 'notice', tag: 'sample-admissions', urdu: { title: 'نمونہ نوٹس: داخلوں سے متعلق اطلاع', excerpt: 'یہ ایک فرضی نوٹس ہے۔' }, expiry: 'none' },
  { collection: 'events', noun: 'event', tag: 'sample-campus-life', urdu: { title: 'نمونہ تقریب: سیمینار', excerpt: 'یہ ایک فرضی تقریب ہے۔' }, expiry: 'event' },
  { collection: 'jobs', noun: 'vacancy', tag: 'sample-careers', urdu: { title: 'نمونہ اسامی: لیکچرر', excerpt: 'یہ ایک فرضی اسامی ہے۔' }, expiry: 'closes' },
  { collection: 'tenders', noun: 'tender', tag: 'sample-careers', urdu: { title: 'نمونہ ٹینڈر: سامان کی خریداری', excerpt: 'یہ ایک فرضی ٹینڈر ہے۔' }, expiry: 'closes' },
]

const CASE: Record<Role, string> = {
  current: 'It is published and current.',
  attachment: 'It is published and has a file attached.',
  closed: 'It is published but closed, so it appears only in the archive.',
  long: 'It has a very long title, to test how headings wrap.',
  today: 'It is published and takes place today.',
  'draft-1': 'It is a draft that nobody has submitted yet.',
  'draft-2': 'It is a draft that nobody has submitted yet.',
  'review-1': 'It has been submitted and waits for an approver.',
  'review-2': 'It has been submitted and waits for an approver.',
}
const body = (noun: string, role: Role) =>
  `This is a Sample ${noun}. It is invented for testing and is not information about the university.\n\n${CASE[role]} Every name, number and date here is made up.`

/** The full set: for each type, one record in every state the workflow test needs. */
export function articleSeeds(): ArticleSeed[] {
  const out: ArticleSeed[] = []
  for (const sp of SPECS) {
    const { collection: c, noun } = sp
    const start = (days: number) => (sp.expiry === 'event' ? { startsDays: days } : {})
    const end = (days: number) => (sp.expiry === 'event' ? {} : { closesDays: days })
    const base = (role: Role, state: SeedState, title: string, publishedDays: number, extra: Partial<ArticleSeed> = {}): ArticleSeed => ({
      collection: c,
      slug: `sample-${noun.replace(/ /g, '-')}-${role}`,
      role,
      title: `Sample ${title}`,
      excerpt: `A Sample ${noun} for testing.`,
      body: body(noun, role),
      state,
      tags: [sp.tag],
      publishedDays,
      ...extra,
    })
    out.push(
      base('current', 'published', `${noun}: published and current`, -3, {
        ...start(14),
        ...end(30),
        urdu: { title: sp.urdu.title, excerpt: sp.urdu.excerpt, body: `${sp.urdu.excerpt}\n\n${URDU_DRAFT_NOTE}` },
      }),
      base('attachment', 'published', `${noun}: with an attached file`, -10, { ...start(21), ...end(40), attachment: `Sample ${noun} file (PDF)` }),
      base('closed', 'published', `${noun}: closed and in the archive`, -45, { ...start(-20), ...end(-10) }),
      base('long', 'published', `${noun}${LONG}`, -5, { ...start(30), ...end(20) }),
      base('draft-1', 'draft', `${noun}: draft one, not yet submitted`, -1, { ...start(40), ...end(50) }),
      base('draft-2', 'draft', `${noun}: draft two, not yet submitted`, -1, { ...start(41), ...end(51) }),
      base('review-1', 'in_review', `${noun}: waiting for review one`, -1, { ...start(42), ...end(52) }),
      base('review-2', 'in_review', `${noun}: waiting for review two`, -1, { ...start(43), ...end(53) }),
    )
    if (sp.expiry === 'event') out.push(base('today', 'published', 'event: happening today', -2, { startsDays: 1 / 24 }))
  }
  return out
}

/** A few current records for the DCST department page. Their titles say Sample, like every other invented record. */
export function departmentArticleSeeds(): ArticleSeed[] {
  const mk = (collection: Coll, noun: string, n: number, title: string, publishedDays: number, extra: Partial<ArticleSeed> = {}): ArticleSeed => ({
    collection,
    slug: `sample-dcst-${noun}-${n}`,
    role: 'current',
    title: `Sample DCST ${noun}: ${title}`,
    excerpt: `A Sample ${noun} for the department page.`,
    body: body(noun, 'current'),
    state: 'published',
    tags: ['dcst'],
    publishedDays,
    ...extra,
  })
  return [
    mk('posts', 'news', 1, 'students present their project posters', -2),
    mk('posts', 'news', 2, 'guest lecture on machine learning', -9),
    mk('events', 'event', 1, 'programming contest', -3, { startsDays: 7 }),
    mk('events', 'event', 2, 'open day for new students', -4, { startsDays: 16 }),
    mk('notices', 'notice', 1, 'semester timetable posted', -1),
    mk('notices', 'notice', 2, 'project proposal deadline', -6),
  ]
}

export type MeritSeed = { slug: string; title: string; cycle: string; programme: string; state: SeedState; documents: string[] }
export const meritLists: MeritSeed[] = [
  { slug: 'sample-merit-list-first', title: 'Sample merit list: first list', cycle: 'Sample Fall', programme: 'Sample Programme A', state: 'published', documents: ['Sample merit list, first list (PDF)'] },
  { slug: 'sample-merit-list-second', title: 'Sample merit list: second list', cycle: 'Sample Fall', programme: 'Sample Programme A', state: 'published', documents: ['Sample merit list, second list (PDF)', 'Sample waiting list (PDF)'] },
  { slug: 'sample-merit-list-draft', title: 'Sample merit list: draft', cycle: 'Sample Spring', programme: 'Sample Programme B', state: 'draft', documents: [] },
  { slug: 'sample-merit-list-review', title: 'Sample merit list: waiting for review', cycle: 'Sample Spring', programme: 'Sample Programme B', state: 'in_review', documents: ['Sample merit list (PDF)'] },
]

/** The first published record of each kind and the one with a file get a placeholder hero image, so the pickers have content. */
function hero(a: ArticleSeed, media: Map<string, number | string>): number | string | undefined {
  if (a.state !== 'published' || (a.role !== 'current' && a.role !== 'attachment')) return undefined
  return media.get(placeholderImages[a.role === 'current' ? 0 : 1].name)
}

const DAY = 86_400_000
/** The one generated placeholder PDF, served from the site itself (a path on this site is a valid attachment address). */
const SAMPLE_FILE = (_slug: string) => PDF_ADDRESS
const iso = (now: number, days: number) => new Date(now + days * DAY).toISOString()

export async function applyArticleSeeds(
  cms: Cms,
  actor: SeedActor,
  now = Date.now(),
  /** Media ids by placeholder file name (from applyMediaSeeds); the published records with a file get one as hero image. */
  media: Map<string, number | string> = new Map(),
): Promise<FlowResult> {
  let out = emptyResult()
  const tagIds = new Map<string, number | string>()

  const existingTags = await loadBySource(cms, 'article-tags')
  for (const t of tags) {
    const source = sampleSource('article-tags', t.slug)
    tagIds.set(
      t.slug,
      await seedRecord(cms, actor, existingTags, { collection: 'article-tags', source, state: 'published', data: { name: t.name, slug: t.slug, governance: { ownerOffice: SAMPLE_OWNER_OFFICE, source } } }, out),
    )
  }

  for (const t of departmentTags) {
    const source = sampleSource('article-tags', t.slug)
    tagIds.set(
      t.slug,
      await seedRecord(cms, actor, existingTags, { collection: 'article-tags', source, state: 'published', data: { name: t.name, slug: t.slug, governance: { ownerOffice: SAMPLE_OWNER_OFFICE, source } } }, out),
    )
  }

  for (const collection of ARTICLE_COLLECTIONS) {
    const existing = await loadBySource(cms, collection)
    for (const a of [...articleSeeds(), ...departmentArticleSeeds()].filter((x) => x.collection === collection)) {
      const source = sampleSource(collection, a.slug)
      const lexical = (text: string) => textToLexical(text)
      const governance: Record<string, unknown> = { ownerOffice: SAMPLE_OWNER_OFFICE, source }
      const expiry = a.collection === 'events' ? (a.startsDays ?? 0) + 4 / 24 : a.closesDays
      if (expiry !== undefined) governance.expireAt = iso(now, expiry)
      const data: Record<string, unknown> = {
        title: a.title,
        slug: a.slug,
        publishedAt: iso(now, a.publishedDays),
        tags: a.tags.map((s) => tagIds.get(s)).filter((id) => id !== undefined),
        governance,
        ...(collection === 'posts' ? { content: lexical(a.body) } : { excerpt: a.excerpt, body: lexical(a.body) }),
        ...(collection === 'events' ? { startsAt: iso(now, a.startsDays ?? 0), venue: 'Sample Hall' } : {}),
        ...(a.attachment && collection !== 'posts' ? { attachments: [{ label: a.attachment, url: SAMPLE_FILE(a.slug) }] } : {}),
        ...(hero(a, media) !== undefined ? { heroImage: hero(a, media) } : {}),
      }
      // News (posts) keeps one title in every language, so its Urdu case is the Urdu title itself.
      if (collection === 'posts' && a.urdu) data.title = a.urdu.title
      const ur =
        a.urdu && collection !== 'posts'
          ? { title: a.urdu.title, excerpt: a.urdu.excerpt, body: lexical(a.urdu.body) }
          : undefined
      await seedRecord(cms, actor, existing, { collection, source, state: a.state, data, ...(ur ? { ur } : {}) }, out)
    }
  }

  const existingMerit = await loadBySource(cms, 'merit-lists')
  for (const m of meritLists) {
    const source = sampleSource('merit-lists', m.slug)
    await seedRecord(
      cms,
      actor,
      existingMerit,
      {
        collection: 'merit-lists',
        source,
        state: m.state,
        data: {
          title: m.title,
          admissionCycle: m.cycle,
          programme: m.programme,
          documents: m.documents.map((label, i) => ({ label, url: SAMPLE_FILE(`${m.slug}-${i + 1}`) })),
          governance: { ownerOffice: SAMPLE_OWNER_OFFICE, source },
        },
      },
      out,
    )
  }
  return addResults(emptyResult(), out)
}
