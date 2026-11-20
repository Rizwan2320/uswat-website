import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { heroSlides } from '../../src/site/content/hero'
import { footerQuick, footerUseful, nav } from '../../src/site/content/nav'

/* Every address the header menu and footer point at on this site must be a real route, and an entry the official site
   has no counterpart for here must still say it leaves the site (prediction A4-r). */

const APP = join(__dirname, '../../src/app')

/** Route patterns from every page.tsx under src/app, with route groups removed: `/news/[slug]` becomes /^\/news\/[^/]+$/. */
function routes(dir = APP, base = ''): RegExp[] {
  const out: RegExp[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      const part = /^\(.*\)$/.test(name) ? '' : `/${name}`
      out.push(...routes(full, base + part))
    } else if (name === 'page.tsx') {
      const pattern = (base || '/').split('/').map((s) => (/^\[\.\.\.[^\]]+\]$/.test(s) ? '.+' : /^\[[^\]]+\]$/.test(s) ? '[^/]+' : s.replace(/[.*+?^${}()|\\]/g, '\\$&'))).join('/')
      out.push(new RegExp(`^${pattern}$`))
    }
  }
  return out
}

const all = [
  ...nav.flatMap((i) => [{ where: i.label, href: i.href, external: i.external }, ...(i.children ?? []).map((c) => ({ where: `${i.label} > ${c.label}`, href: c.href, external: c.external }))]),
  ...[...footerQuick, ...footerUseful].map((l) => ({ where: `footer ${l.label}`, href: l.href, external: undefined as boolean | undefined })),
  ...heroSlides.flatMap((s) => [s.primary, s.secondary].map((c) => ({ where: `hero ${c.label}`, href: c.href, external: undefined as boolean | undefined }))),
]
const pages = routes()

describe('header menu and footer links', () => {
  it('finds the routes', () => {
    expect(pages.length).toBeGreaterThan(10)
    expect(existsSync(APP)).toBe(true)
  })

  it('send every on-site link to a route that exists', () => {
    const internal = all.filter((l) => l.href.startsWith('/'))
    expect(internal.length).toBeGreaterThan(8)
    for (const l of internal) {
      const path = l.href.split(/[?#]/)[0]!
      expect(pages.some((r) => r.test(path)), `${l.where} -> ${l.href}`).toBe(true)
    }
  })

  it('mark an entry external exactly when it points off the site', () => {
    for (const l of all.filter((x) => x.where.indexOf('footer ') !== 0 && x.where.indexOf('hero ') !== 0)) {
      expect(Boolean(l.external), `${l.where}`).toBe(!l.href.startsWith('/'))
    }
  })

  it('keep the pages this site now has on the site', () => {
    const at = (label: string) => all.find((l) => l.where === label)?.href
    expect(at('Academics')).toBe('/academics')
    expect(at('Campus Life')).toBe('/campuses/main')
    expect(at('News & Events > Latest News')).toBe('/news')
    expect(at('News & Events > Announcements')).toBe('/notices')
    expect(at('News & Events > Events')).toBe('/events')
    expect(at('About')).toBe('/about')
    expect(at('footer Contact Us')).toBe('/contact/directory')
    expect(at('hero Explore Programs')).toBe('/academics')
    expect(at('hero Latest News')).toBe('/news')
    expect(at('hero Upcoming Events')).toBe('/events')
  })

  it('leave no official-site link where a page of ours now exists', () => {
    const official = /^https:\/\/uswat\.edu\.pk\/(faculty|maincampus|women-campus|category\/(latestnews|announcements|events)|about-university|contact-list)\/?$/
    // The faculty page and the department pages have no equivalent here (departments live inside /academics), so only the
    // two campus pages, the three feed categories, About and the contact list are checked.
    for (const l of all) {
      if (/^https:\/\/uswat\.edu\.pk\/faculty\/?$/.test(l.href)) continue
      expect(official.test(l.href), `${l.where} -> ${l.href}`).toBe(false)
    }
  })
})
