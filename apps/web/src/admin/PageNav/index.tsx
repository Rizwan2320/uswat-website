import type { ServerProps } from 'payload'
import React from 'react'

import { deskFor, loadPageLinks, type PageLink } from '../../governance/roleBoards'

import './index.scss'

/** Presentational and synchronous, so it can be rendered in a test. */
export function PageNavView({
  links,
  desk,
}: {
  links: PageLink[]
  desk: ReturnType<typeof deskFor>
}): React.ReactElement | null {
  if (links.length === 0) return null
  const label =
    desk === 'head'
      ? 'Your department page'
      : links.length > 1
        ? 'Your programme pages'
        : 'Your programme page'
  return (
    <nav className="page-nav" aria-label={label}>
      <p className="page-nav__label">{label}</p>
      <ul className="page-nav__list">
        {links.map((l) => (
          <li key={`${l.collection}-${l.id}`}>
            <a className="nav__link page-nav__link" href={l.href}>
              <span className="nav__link-label">{l.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * At the top of the left menu: the page a head or a coordinator runs, one link to everything on it
 * (slice 3as), the way "Home page content" is one link for the home page. Nothing for anyone else.
 */
export default async function PageNav({ payload, user }: ServerProps) {
  if (!user) return null
  const links = await loadPageLinks(payload, user as never)
  return <PageNavView links={links} desk={deskFor(user as never)} />
}
