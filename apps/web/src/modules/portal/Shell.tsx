import Link from 'next/link'
import type { ReactNode } from 'react'

import { COPY } from './copy'
import SignOutButton from './SignOutButton'

/** Header and main landmark. `email` present means a signed-in page (shows navigation and sign-out). */
export default function Shell({ email, children }: { email?: string | null; children: ReactNode }) {
  return (
    <>
      <header className="portal-head">
        <Link className="portal-brand" href={email ? '/portal' : '/portal/sign-in'}>{COPY.siteName}</Link>
        {email ? (
          <nav className="portal-nav" aria-label="Portal">
            <Link href="/portal">{COPY.nav.home}</Link>
            <Link href="/portal/security">{COPY.nav.security}</Link>
            <SignOutButton />
          </nav>
        ) : null}
      </header>
      <main id="main" className="portal-main" tabIndex={-1}>{children}</main>
    </>
  )
}
