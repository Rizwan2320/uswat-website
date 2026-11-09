'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { ur, type Lang } from '../content/i18n'

/* Client-side EN/UR toggle. State lives in memory only (no localStorage, no cookies, no new routes).
   Server HTML is always English; switching updates <html lang dir> and the translated chrome strings. */
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }
const I18nContext = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (k) => k })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    const root = document.documentElement
    root.lang = l
    root.dir = l === 'ur' ? 'rtl' : 'ltr'
  }, [])

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (key) => (lang === 'ur' ? (ur[key] ?? key) : key) }),
    [lang, setLang],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

/** Translated chrome text: <T k="Apply Online" />. Falls back to the English key when no Urdu string exists. */
export function T({ k }: { k: string }) {
  const { lang, t } = useI18n()
  const text = t(k)
  // Only strings that really were translated get lang="ur" (and so the Urdu typeface); untranslated English stays as is.
  return text !== k && lang === 'ur' ? <span lang="ur">{text}</span> : <>{text}</>
}

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n()
  return (
    <span className={className} role="group" aria-label="Language">
      <button type="button" lang="ur" aria-pressed={lang === 'ur'} onClick={() => setLang('ur')} style={btn(lang === 'ur')}>
        اردو
      </button>
      <span aria-hidden="true" style={{ opacity: 0.5 }}>|</span>
      <button type="button" lang="en" aria-pressed={lang === 'en'} onClick={() => setLang('en')} style={btn(lang === 'en')}>
        Eng
      </button>
    </span>
  )
}

const btn = (active: boolean): React.CSSProperties => ({
  background: 'none',
  border: 0,
  color: 'inherit',
  cursor: 'pointer',
  padding: '8px 6px',
  minHeight: 32,
  fontWeight: active ? 700 : 400,
  textDecoration: active ? 'underline' : 'none',
  textUnderlineOffset: 4,
})
