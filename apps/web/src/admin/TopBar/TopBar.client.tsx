'use client'

import { formatAdminURL } from 'payload/shared'
import { useConfig, useTranslation } from '@payloadcms/ui'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { parentPath, showBack, TOP_BAR_COPY } from './rules'

/** Back and Sign out, always visible (slice 3ap). Sign out is Payload's own logout address. */
export function TopBarClient({ who }: { who: string }) {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const { config } = useConfig()
  const { i18n } = useTranslation()
  const ur = i18n?.language === 'ur'
  const t = (k: keyof typeof TOP_BAR_COPY) => TOP_BAR_COPY[k][ur ? 'ur' : 'en']

  const adminRoute = config.routes.admin
  const logout = formatAdminURL({ adminRoute, path: config.admin.routes.logout })
  const back = showBack(pathname, adminRoute)

  // Counts the screens opened inside the admin since this page was loaded. The browser's own history
  // length cannot say whether the step before is an admin screen, so it is not used.
  const moves = useRef(0)
  const last = useRef(pathname)
  useEffect(() => {
    if (last.current !== pathname) {
      moves.current += 1
      last.current = pathname
    }
  }, [pathname])

  const goBack = () => {
    // One step back when this tab has moved between admin screens; otherwise one level up,
    // so the button never leaves the admin and never does nothing.
    if (moves.current > 0) router.back()
    else router.push(parentPath(pathname, adminRoute))
  }

  return (
    <nav className="top-bar" aria-label={t('bar')} dir={ur ? 'rtl' : 'ltr'} lang={ur ? 'ur' : 'en'}>
      {back ? (
        <button type="button" className="top-bar__btn top-bar__back" onClick={goBack} title={t('backTo')}>
          <span aria-hidden="true" className="top-bar__arrow">
            {ur ? '→' : '←'}
          </span>
          {t('back')}
        </button>
      ) : (
        <span />
      )}
      <span className="top-bar__right">
        {who ? (
          <span className="top-bar__who">
            {t('signedInAs')} <strong>{who}</strong>
          </span>
        ) : null}
        <a className="top-bar__btn top-bar__out" href={logout}>
          {t('signOut')}
        </a>
      </span>
    </nav>
  )
}
