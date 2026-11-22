import type { ReactNode } from 'react'

import { headerRoles } from './headerRoles'
import PortalHeader from './PortalHeader'

/** Header and main landmark. `email` present means a signed-in page (shows navigation and sign-out). */
export default async function Shell({ email, wide, pending, children }: { email?: string | null; wide?: boolean; pending?: boolean; children: ReactNode }) {
  const roles = await headerRoles(email && !pending ? email : null)
  return (
    <>
      <PortalHeader email={email ?? null} pending={pending} roles={roles} />
      <main id="main" className={wide ? 'portal-main wide' : 'portal-main'} tabIndex={-1}>{children}</main>
    </>
  )
}
