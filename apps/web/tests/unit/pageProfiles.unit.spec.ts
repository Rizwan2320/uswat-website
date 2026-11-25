import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { PAGE_PROFILES, OFFICE_PROFILES, profileForPage } from '../../src/site/offices/profiles'

const root = process.cwd()
const nav = readFileSync(path.join(root, 'src/site/content/nav.ts'), 'utf8')
const sitemap = readFileSync(path.join(root, 'src/site/sitemap/entries.ts'), 'utf8')

/* The pages the header menu links to. The other department pages are reached from the departments list, the sitemap and the old addresses. */
const MENU = ['academic-calendar', 'central-library-office', 'english-and-foreign-languages', 'management-commerce', 'quality-enhancement-cell']

describe('office-style pages at their own address (PAGE_PROFILES)', () => {
  it('has the ten pages, each with a unique slug and a path that starts with a slash', () => {
    expect(PAGE_PROFILES.map((p) => p.slug).sort()).toEqual(
      [
        'academic-calendar',
        'archaeology',
        'central-library-office',
        'economics-and-development-studies',
        'english-and-foreign-languages',
        'environmental-sciences',
        'geology',
        'management-commerce',
        'quality-enhancement-cell',
        'research-group',
      ].sort(),
    )
    expect(new Set(PAGE_PROFILES.map((p) => p.path)).size).toBe(PAGE_PROFILES.length)
    for (const p of PAGE_PROFILES) {
      expect(p.path?.startsWith('/')).toBe(true)
      expect(p.lists).toEqual([])
      expect(profileForPage(p.slug)).toBe(p)
    }
  })

  it('does not reuse the slug of an office that has a CMS record', () => {
    const office = new Set(OFFICE_PROFILES.map((o) => o.slug))
    for (const p of PAGE_PROFILES) expect(office.has(p.slug)).toBe(false)
  })

  it('has a route file, a sitemap entry, a banner and a hero picture for every page, and a menu entry for the pages the menu names', () => {
    for (const p of PAGE_PROFILES) {
      expect(existsSync(path.join(root, 'src/app/(site)/(cms)', p.path!, 'page.tsx')), `${p.slug} route`).toBe(true)
      expect(sitemap.includes(`'${p.path}'`), `${p.slug} sitemap`).toBe(true)
      if (MENU.includes(p.slug)) expect(nav.includes(`'${p.path}'`), `${p.slug} menu`).toBe(true)
      expect(existsSync(path.join(root, 'public', p.banner.src)), `${p.slug} banner`).toBe(true)
      expect(existsSync(path.join(root, 'public', p.hero.src)), `${p.slug} hero`).toBe(true)
    }
  })

  it('gives every fact a source address and a day it was read (rule 3)', () => {
    for (const p of PAGE_PROFILES) {
      expect(p.sources.length).toBeGreaterThan(0)
      for (const s of p.sources) expect(s.url.startsWith('https://uswat.edu.pk/')).toBe(true)
      expect(p.officialPage.startsWith('https://uswat.edu.pk/')).toBe(true)
      expect(p.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(p.openPoints?.length ?? 0).toBeGreaterThan(0)
    }
  })

  it('shows only the department or office address, never a person’s address, and no placeholder text', () => {
    for (const p of PAGE_PROFILES) {
      for (const e of p.emails ?? []) expect(e).toMatch(/^(cmc|defl|librarian|qec|cess|deds)@uswat\.edu\.pk$/)
      for (const person of p.people) {
        expect(person.name + person.title).not.toMatch(/@/)
      }
      expect(JSON.stringify(p)).not.toMatch(/sample|lorem|tbd|gmail/i)
    }
  })

  it('cites a source address that is an old address in the route map (so the redirect and the source agree)', () => {
    const csv = readFileSync(path.join(root, '../../scripts/import/data/route_map.csv'), 'utf8')
    for (const p of PAGE_PROFILES) {
      expect(csv.includes(`${p.officialPage},`), `${p.slug}: ${p.officialPage}`).toBe(true)
      for (const s of p.sources) expect(csv.includes(`${s.url},`), `${p.slug}: ${s.url}`).toBe(true)
    }
  })

  it('has unique person ids per page and ISO dates in the dated lists', () => {
    for (const p of PAGE_PROFILES) {
      expect(new Set(p.people.map((x) => x.id)).size).toBe(p.people.length)
      for (const m of p.milestones ?? []) expect(m.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('counts in the stats match the lists on the page', () => {
    const cmc = profileForPage('management-commerce')!
    expect(cmc.stats?.[0].value).toBe(cmc.itemLists?.[0].items.length)
    expect(cmc.stats?.[1].value).toBe(cmc.people.length)
    const defl = profileForPage('english-and-foreign-languages')!
    expect(defl.stats?.[0].value).toBe(defl.itemLists?.[0].items.length)
    expect(defl.stats?.[1].value).toBe(defl.people.length)
    const qec = profileForPage('quality-enhancement-cell')!
    expect(qec.stats?.[0].value).toBe(qec.people.length)
    expect(qec.stats?.[1].value).toBe(qec.milestones?.length)
    expect(qec.stats?.[2].value).toBe(qec.itemLists?.[0].items.length)
    for (const slug of ['geology', 'archaeology', 'environmental-sciences', 'economics-and-development-studies']) {
      const d = profileForPage(slug)!
      expect(d.stats?.[0].value, `${slug} programmes`).toBe(d.itemLists?.[0].items.length)
      expect(d.stats?.[1].value, `${slug} faculty`).toBe(d.people.length)
    }
  })

  it('shows every item list and statement with real words and counts the lists that the page numbers', () => {
    const archaeology = profileForPage('archaeology')!
    expect(archaeology.itemLists?.find((l) => l.title === 'Mission')?.items).toHaveLength(8)
    expect(archaeology.itemLists?.find((l) => l.title === 'Strategic plan for achieving the objectives')?.items).toHaveLength(11)
    expect(profileForPage('geology')!.itemLists?.find((l) => l.title === 'Groups of elective courses')?.items).toHaveLength(10)
    for (const p of PAGE_PROFILES) {
      for (const l of p.itemLists ?? []) for (const item of l.items) expect(item.trim().length, `${p.slug}: ${l.title}`).toBeGreaterThan(3)
    }
  })
})
