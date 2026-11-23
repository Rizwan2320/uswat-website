import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { COPY } from './copy'
import Valley from './Valley'

/**
 * The frame for the pages you see before you are signed in (sign-in, recovery code): the valley on one side, the form on the other.
 * Under 860px the valley becomes a band above the form. The page's own `<h1>` and form are the children.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  const A = COPY.auth
  return (
    <div className="auth">
      <aside className="auth-art">
        <Valley className="auth-valley auth-valley-tall" width={800} height={900} sun={0.68} />
        <Valley className="auth-valley auth-valley-band" width={800} height={300} sun={0.74} horizon={0.1} sunRadius={30} />
        <div className="auth-brand">
          <Image src="/images/crest.png" alt="" width={52} height={52} className="auth-crest" priority />
          <p className="auth-brand-name">{COPY.header.brandTop}<span>{COPY.header.brandName}</span></p>
        </div>
        <p className="auth-line">{A.line}</p>
      </aside>
      <main id="main" className="auth-main" tabIndex={-1}>
        <div className="auth-top"><Link href="/">{COPY.header.website}</Link></div>
        <div className="auth-body">{children}</div>
        <p className="auth-foot">{A.foot}</p>
      </main>
    </div>
  )
}
