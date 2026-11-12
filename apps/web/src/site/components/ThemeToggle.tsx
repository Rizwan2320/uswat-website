'use client'

import { useSyncExternalStore } from 'react'

import { useI18n } from './I18n'
import { MoonIcon, SunIcon } from './icons'

/* Light / dark switch (docs/briefs/dark-mode.md). The visitor's system setting applies until they press this; after that
   their choice is stored in localStorage ('uswat-theme') and the inline script in the layout re-applies it before first
   paint. Storage is optional: if it is blocked the choice lasts until the page is reloaded.
   Both icons are in the markup and CSS shows the right one, so the server HTML never depends on the stored choice.
   `aria-pressed` is set after mount, once the real theme is known. */
const KEY = 'uswat-theme'
const QUERY = '(prefers-color-scheme: dark)'

const isDark = () => {
  const chosen = document.documentElement.getAttribute('data-theme')
  return chosen ? chosen === 'dark' : window.matchMedia(QUERY).matches
}

// The theme lives outside React (an attribute on <html> and the system setting), so it is read as an external store.
const listeners = new Set<() => void>()
const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => {
    listeners.delete(onChange)
    mq.removeEventListener('change', onChange)
  }
}
const serverSnapshot = (): boolean | null => null // unknown on the server, so aria-pressed is left off until hydration

export default function ThemeToggle({ className, iconClassName }: { className?: string; iconClassName?: { sun: string; moon: string } }) {
  const { t } = useI18n()
  const dark = useSyncExternalStore<boolean | null>(subscribe, isDark, serverSnapshot)

  const flip = () => {
    const next = isDark() ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* private window or blocked storage: the choice just lasts for this page view */
    }
    listeners.forEach((l) => l())
  }

  return (
    <button type="button" className={className} aria-pressed={dark ?? undefined} aria-label={t('Dark mode')} onClick={flip}>
      <MoonIcon className={iconClassName?.moon} />
      <SunIcon className={iconClassName?.sun} />
    </button>
  )
}
