'use client'
/**
 * The portal's header, built like the public site's: a dark utility bar, then a white bar with the crest, the menu and a gold button.
 * Menus open on click or Enter and close on Escape, on a click elsewhere and when focus leaves; under 1100px the menu is a drawer.
 * It only shows links; every page behind them checks who is asking.
 */
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import { COPY } from './copy'
import type { HeaderRoles } from './headerRoles'
import SignOutButton from './SignOutButton'

type Item = { href: string; label: string; hint?: string }
type Entry = { kind: 'link'; item: Item } | { kind: 'menu'; label: string; items: Item[] }

const N = COPY.nav
const H = COPY.header

function entries(roles: HeaderRoles): Entry[] {
  const work: Item[] = [
    ...(roles.review ? [{ href: '/portal/review', label: N.review, hint: H.hints.review }] : []),
    ...(roles.activate ? [{ href: '/portal/activate', label: N.activate, hint: H.hints.activate }] : []),
    ...(roles.registrar ? [{ href: '/portal/registrar', label: N.registrar, hint: H.hints.registrar }] : []),
  ]
  return [
    { kind: 'link', item: { href: '/portal', label: N.home } },
    {
      kind: 'menu',
      label: H.records,
      items: [
        { href: '/portal/profile', label: N.profile, hint: H.hints.profile },
        { href: '/portal/publications', label: N.publications, hint: H.hints.publications },
        { href: '/portal/courses', label: N.courses, hint: H.hints.courses },
        { href: '/portal/cv', label: N.cv, hint: H.hints.cv },
      ],
    },
    { kind: 'link', item: { href: '/portal/delegation', label: N.delegation } },
    { kind: 'link', item: { href: '/portal/notifications', label: N.notifications } },
    ...(work.length > 0 ? ([{ kind: 'menu', label: H.work, items: work }] as Entry[]) : []),
    { kind: 'link', item: { href: '/portal/security', label: N.security } },
  ]
}

const isCurrent = (path: string, href: string) => (href === '/portal' ? path === href : path === href || path.startsWith(`${href}/`))

function Menu({ label, items, path }: { label: string; items: Item[]; path: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLLIElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const id = useId()
  const here = items.some((i) => isCurrent(path, i.href))
  const [seen, setSeen] = useState(path)
  if (seen !== path) { setSeen(path); setOpen(false) }
  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [open])
  return (
    <li
      ref={root}
      className="phd-item"
      onKeyDown={(e) => { if (e.key === 'Escape' && open) { setOpen(false); btn.current?.focus() } }}
      onBlur={(e) => { if (open && !root.current?.contains(e.relatedTarget as Node | null)) setOpen(false) }}
    >
      <button ref={btn} type="button" className={`phd-link${here ? ' is-current' : ''}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        {label} <span className="phd-caret" aria-hidden="true">▾</span>
      </button>
      <div id={id} className="phd-sub" hidden={!open}>
        {items.map((i) => (
          <Link key={i.href} href={i.href} aria-current={isCurrent(path, i.href) ? 'page' : undefined} onClick={() => setOpen(false)}>
            <span className="phd-sub-title">{i.label}</span>
            {i.hint ? <span className="phd-sub-hint">{i.hint}</span> : null}
          </Link>
        ))}
      </div>
    </li>
  )
}

export default function PortalHeader({ email, pending, roles }: { email: string | null; pending?: boolean; roles: HeaderRoles }) {
  const path = usePathname() ?? ''
  const [drawer, setDrawer] = useState(false)
  const drawerId = useId()
  const burger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const list = email && !pending ? entries(roles) : []
  const [seen, setSeen] = useState(path)
  if (seen !== path) { setSeen(path); setDrawer(false) }
  useEffect(() => {
    if (!drawer) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setDrawer(false); burger.current?.focus() } }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('a, button')?.focus()
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [drawer])

  return (
    <div className="portal-top">
      <aside className="portal-util" aria-label={H.utilLabel}>
        <div className="portal-util-in">
          <p className="portal-util-left"><span>{H.place}</span><span className="portal-util-div" aria-hidden="true" /><span className="portal-util-tag">{H.tagline}</span></p>
          <p className="portal-util-right">
            <Link href="/">{H.website}</Link>
            {email ? <><span aria-hidden="true" className="portal-util-sep">|</span><span className="portal-util-who" title={email}>{email}</span></> : null}
          </p>
        </div>
      </aside>
      <header className="portal-head">
        <div className="portal-head-in">
          <Link className="portal-brand" href={email ? '/portal' : '/portal/sign-in'} aria-label={COPY.siteName}>
            <Image src="/images/crest.png" alt="" width={40} height={40} className="portal-crest" priority />
            <span className="portal-brand-text"><span className="portal-brand-sub">{H.brandTop}</span>{H.brandName}</span>
          </Link>
          {list.length > 0 ? (
            <>
              <span className="phd-rule" aria-hidden="true" />
              <nav className="phd-nav" aria-label="Portal">
                <ul className="phd-list">
                  {list.map((e) =>
                    e.kind === 'link' ? (
                      <li key={e.item.href} className="phd-item">
                        <Link className={`phd-link${isCurrent(path, e.item.href) ? ' is-current' : ''}`} href={e.item.href} aria-current={isCurrent(path, e.item.href) ? 'page' : undefined}>{e.item.label}</Link>
                      </li>
                    ) : (
                      <Menu key={e.label} label={e.label} items={e.items} path={path} />
                    ),
                  )}
                </ul>
              </nav>
              <span className="phd-rule" aria-hidden="true" />
            </>
          ) : <span className="phd-grow" />}
          {email ? <SignOutButton variant="gold" /> : null}
          {list.length > 0 ? (
            <button ref={burger} type="button" className="phd-burger" aria-label={H.menu} aria-expanded={drawer} aria-controls={drawerId} onClick={() => setDrawer((v) => !v)}>
              <span aria-hidden="true">{drawer ? '✕' : '☰'}</span>
            </button>
          ) : null}
        </div>
      </header>
      {drawer ? <div className="phd-scrim" onClick={() => setDrawer(false)} aria-hidden="true" /> : null}
      {list.length > 0 ? (
        <div id={drawerId} ref={panel} className="phd-drawer" hidden={!drawer} role="dialog" aria-modal="true" aria-label={H.menu}>
          <ul>
            {list.flatMap((e) => (e.kind === 'link' ? [e.item] : e.items)).map((i) => (
              <li key={i.href}><Link href={i.href} aria-current={isCurrent(path, i.href) ? 'page' : undefined}>{i.label}</Link></li>
            ))}
          </ul>
          <div className="phd-drawer-foot"><SignOutButton variant="gold" /></div>
        </div>
      ) : null}
    </div>
  )
}
