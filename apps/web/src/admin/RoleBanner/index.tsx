import type { ServerProps } from 'payload'
import React from 'react'

import { actorFromUser, normalizeOffice } from '../../governance/roles'
import { whoAmI } from '../../governance/whoAmI'

import './index.scss'

/**
 * A thin bar at the top of every admin screen saying who you are and what that means (slice 3ai).
 * Programme names are read with the person's own access; if that fails the bar still shows.
 */
export default async function RoleBanner({ payload, user, i18n }: ServerProps) {
  if (!user) return null
  const actor = actorFromUser(user as never)
  let names: string[] = []
  if (actor.kind === 'user' && (actor.programmes?.length ?? 0) > 0) {
    try {
      const res = await payload.find({
        collection: 'programmes',
        where: { id: { in: actor.programmes } },
        depth: 0,
        limit: 20,
        pagination: false,
        user: { ...user, collection: 'users' } as never,
        overrideAccess: false,
      })
      names = res.docs
        .map((d) => (d as { name?: unknown }).name)
        .filter((n): n is string => typeof n === 'string' && n.trim() !== '')
    } catch {
      names = []
    }
  }
  // A head's bar names the department whose office they hold, not just the office word (slice 3aq).
  let departments: string[] = []
  if (actor.kind === 'user' && actor.role === 'approver' && actor.offices.length > 0) {
    try {
      const res = await payload.find({
        collection: 'departments',
        depth: 0,
        limit: 200,
        pagination: false,
        user: { ...user, collection: 'users' } as never,
        overrideAccess: false,
      })
      departments = res.docs
        .filter((d) => {
          const o = (d as { governance?: { ownerOffice?: unknown } }).governance?.ownerOffice
          return typeof o === 'string' && actor.offices.includes(normalizeOffice(o))
        })
        .map((d) => (d as { name?: unknown }).name)
        .filter((n): n is string => typeof n === 'string' && n.trim() !== '')
    } catch {
      departments = []
    }
  }
  const me = whoAmI(actor, names, departments)
  const ur = i18n?.language === 'ur'
  return (
    <section
      className={`role-banner role-banner--${me.kind}`}
      aria-label={ur ? 'آپ کا کردار' : 'Your role'}
      dir={ur ? 'rtl' : 'ltr'}
      lang={ur ? 'ur' : 'en'}
    >
      <strong className="role-banner__title">{ur ? me.title.ur : me.title.en}</strong>
      <span className="role-banner__detail">{ur ? me.detail.ur : me.detail.en}</span>
    </section>
  )
}
