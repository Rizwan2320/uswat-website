import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PageNavView } from '../../src/admin/PageNav'
import type { PageLink } from '../../src/governance/roleBoards'

const link = (over: Partial<PageLink> = {}): PageLink => ({
  collection: 'departments',
  id: 9,
  name: 'Department of Computer and Software Technologies',
  href: '/admin/collections/departments/9',
  ...over,
})
const render = (props: Parameters<typeof PageNavView>[0]) =>
  renderToStaticMarkup(createElement(PageNavView, props))

describe('the link to my own page at the top of the menu (slice 3as)', () => {
  it('gives a head one link to the department page', () => {
    const html = render({ links: [link()], desk: 'head' })
    expect(html).toContain('Your department page')
    expect(html).toContain('href="/admin/collections/departments/9"')
    expect(html).toContain('Department of Computer and Software Technologies')
  })

  it('gives a coordinator a link to their programme, and says pages when there are several', () => {
    const one = render({
      links: [link({ collection: 'programmes', name: 'BS Computer Science', href: '/p/1' })],
      desk: 'coordinator',
    })
    expect(one).toContain('Your programme page')
    expect(one).not.toContain('Your programme pages')
    const two = render({
      links: [
        link({ collection: 'programmes', id: 1, name: 'BS CS', href: '/p/1' }),
        link({ collection: 'programmes', id: 2, name: 'BS SE', href: '/p/2' }),
      ],
      desk: 'coordinator',
    })
    expect(two).toContain('Your programme pages')
    expect(two).toContain('href="/p/2"')
  })

  it('shows nothing when there is no page to link to', () => {
    expect(render({ links: [], desk: 'head' })).toBe('')
    expect(render({ links: [], desk: 'coordinator' })).toBe('')
  })

  it('is a labelled navigation region with a real link for each page', () => {
    const html = render({ links: [link()], desk: 'head' })
    expect(html).toContain('<nav class="page-nav" aria-label="Your department page">')
    expect(html).toMatch(/<a class="nav__link page-nav__link" href="[^"]+">/)
  })
})
