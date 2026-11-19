import Link from 'next/link'
import type { ReactNode } from 'react'

import { COPY } from './copy'
import SignOutButton from './SignOutButton'

/** Header and main landmark. `email` present means a signed-in page (shows navigation and sign-out). */
export default function Shell({ email, wide, children }: { email?: string | null; wide?: boolean; children: ReactNode }) {
  return (
    <>
      <header className="portal-head">
        <Link className="portal-brand" href={email ? '/portal' : '/portal/sign-in'}>{COPY.siteName}</Link>
        {email ? (
          <nav className="portal-nav" aria-label="Portal">
            <Link href="/portal">{COPY.nav.home}</Link>
            <Link href="/portal/profile">{COPY.nav.profile}</Link>
            <Link href="/portal/publications">{COPY.nav.publications}</Link>
            <Link href="/portal/courses">{COPY.nav.courses}</Link>
            <Link href="/portal/security">{COPY.nav.security}</Link>
            <SignOutButton />
          </nav>
        ) : null}
      </header>
      <main id="main" className={wide ? 'portal-main wide' : 'portal-main'} tabIndex={-1}>{children}</main>
    </>
  )
}
