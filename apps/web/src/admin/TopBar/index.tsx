import type { ServerProps } from 'payload'
import React from 'react'

import { TopBarClient } from './TopBar.client'

import './index.scss'

/** Back and Sign out under the role bar on every admin screen once someone is signed in (slice 3ap). */
export default function TopBar({ user }: ServerProps) {
  if (!user) return null
  const u = user as { name?: unknown; email?: unknown }
  const who = typeof u.name === 'string' && u.name.trim() ? u.name.trim() : String(u.email ?? '')
  return <TopBarClient who={who} />
}
