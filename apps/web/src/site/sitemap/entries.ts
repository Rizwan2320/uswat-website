
/* Pure side of the content sitemap: which collection lives where, and how a record becomes an entry. */

export type Source = { collection: string; path: string }
export type Entry = { loc: string; lastmod: string }

/** Every public record type with its own address, as the route map and the public pages use them. */
export const CONTENT_SOURCES: Source[] = [
  { collection: 'notices', path: '/notices' },
  { collection: 'events', path: '/events' },
  { collection: 'jobs', path: '/jobs' },
  { collection: 'tenders', path: '/tenders' },
  { collection: 'departments', path: '/academics/departments' },
  { collection: 'programmes', path: '/academics/programmes' },
  { collection: 'offices', path: '/administration' },
]

/** The list pages themselves (News is `/news`). */
export const LIST_PAGES = ['/news', '/notices', '/events', '/jobs', '/tenders', '/academics/departments', '/academics/programmes', '/contact/directory', '/research', '/administration', '/about', '/about/vice-chancellors-message', '/faculties/allied-health-sciences', '/academics/departments/management-commerce', '/academics/departments/english-and-foreign-languages', '/academics/departments/geology', '/academics/departments/archaeology', '/academics/departments/environmental-sciences', '/academics/departments/economics-and-development-studies', '/academic-calendar', '/administration/central-library-office', '/administration/quality-enhancement-cell']

export const SITEMAP_REVALIDATE_SECONDS = 300

export const absolute = (base: string, path: string) => `${base.replace(/\/+$/, '')}${path}`

type Doc = Record<string, unknown>

/**
 * One entry per published record that has a slug. Sample records are included: with no real data the demo site is
 * all Sample, and the whole site stays `noindex` until launch (the pages themselves carry the Sample label).
 */
export function toEntries(base: string, path: string, docs: Doc[], now: string): Entry[] {
  return docs.flatMap((d) => {
    const slug = typeof d.slug === 'string' ? d.slug : ''
    if (!slug) return []
    return [{ loc: absolute(base, `${path}/${encodeURIComponent(slug)}`), lastmod: typeof d.updatedAt === 'string' ? d.updatedAt : now }]
  })
}

export const listEntries = (base: string, now: string): Entry[] => LIST_PAGES.map((p) => ({ loc: absolute(base, p), lastmod: now }))
