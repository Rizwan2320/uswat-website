import Link from 'next/link'

import { COPY } from '../copy'

const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })

/** Shown on every page opened with `?for=`: who the person is editing for, until when, and the way back. */
export default function DelegationBanner({ name, expiresAt, backHref }: { name: string; expiresAt: number; backHref: string }) {
  return (
    <div className="portal-banner" role="note" data-testid="delegation-banner">
      {COPY.delegation.banner(name, `${when.format(new Date(expiresAt))} UTC`)}{' '}
      <Link href={backHref}>{COPY.delegation.bannerBack}</Link>
    </div>
  )
}
