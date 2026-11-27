'use client'

import { formatAdminURL } from 'payload/shared'
import { useAuth, useConfig, useField, useTranslation } from '@payloadcms/ui'
import React, { useEffect, useId, useState } from 'react'

import { normalizeOffice } from '../../governance/roles'
import {
  chips,
  options,
  PICKER_COPY,
  withOffice,
  withoutOffice,
  type KnownOffice,
} from './rules'

import './index.scss'

type Loaded = { id: number | string; name?: unknown; governance?: { ownerOffice?: unknown } }

const asKnown = (
  rows: Loaded[],
  kind: 'department' | 'office',
  liveIds?: Set<string>,
): KnownOffice[] =>
  rows.flatMap((r) => {
    const name = typeof r.name === 'string' ? r.name : ''
    const office = r.governance?.ownerOffice
    if (!name || typeof office !== 'string') return []
    return [
      {
        office: normalizeOffice(office),
        name,
        kind,
        ...(liveIds ? { live: liveIds.has(String(r.id)) } : {}),
      },
    ]
  })

/**
 * Offices on the account form, chosen from the departments instead of typed (slice 3aq).
 * The stored value is unchanged: a list of lower-case words.
 */
export default function OfficePicker({ path }: { path: string }) {
  const { value, setValue } = useField<string[]>({ path })
  const { user } = useAuth()
  const { config } = useConfig()
  const { i18n } = useTranslation()
  const ur = i18n?.language === 'ur'
  const t = (k: keyof typeof PICKER_COPY) => PICKER_COPY[k][ur ? 'ur' : 'en']
  const id = useId()

  const [departments, setDepartments] = useState<KnownOffice[]>([])
  const [others, setOthers] = useState<KnownOffice[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [typed, setTyped] = useState('')

  useEffect(() => {
    let live = true
    const get = async (collection: string, drafts = true): Promise<Loaded[]> => {
      const url = formatAdminURL({
        apiRoute: config.routes.api,
        path: `/${collection}?limit=200&depth=0${drafts ? '&draft=true' : '&where[_status][equals]=published'}&locale=en&fallback-locale=none`,
      })
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) throw new Error(String(res.status))
      return ((await res.json()) as { docs?: Loaded[] }).docs ?? []
    }
    Promise.all([get('departments'), get('offices').catch(() => []), get('departments', false)])
      .then(([d, o, published]) => {
        if (!live) return
        setDepartments(asKnown(d, 'department', new Set(published.map((p) => String(p.id)))))
        setOthers(asKnown(o, 'office'))
        setState('ready')
      })
      .catch(() => live && setState('failed'))
    return () => {
      live = false
    }
  }, [config.routes.api])

  const current = Array.isArray(value) ? value : []
  const me = user as { role?: string; offices?: string[] } | null
  const who = { role: me?.role ?? 'contributor', offices: me?.offices ?? [] }
  const isAdmin = who.role === 'platformAdmin'
  const known = [...departments, ...others]
  const choices = options(departments, current, who)

  return (
    <div className="office-picker" dir={ur ? 'rtl' : 'ltr'} lang={ur ? 'ur' : 'en'}>
      <span className="office-picker__label" id={`${id}-label`}>
        {t('label')}
      </span>
      <p className="office-picker__intro">{t('intro')}</p>

      {current.length === 0 ? (
        <p className="office-picker__none">{t('none')}</p>
      ) : (
        <ul className="office-picker__chips" aria-labelledby={`${id}-label`}>
          {chips(current, known).map(({ office, known: k }) => (
            <li key={office} className={`office-picker__chip${k ? '' : ' office-picker__chip--warn'}`}>
              <span>
                {k ? (
                  <>
                    <strong>{k.name}</strong>{' '}
                    <span className="office-picker__kind">
                      ({k.kind === 'department' ? t('department') : t('office')})
                    </span>
                    {k.live === false ? (
                      <span className="office-picker__kind">
                        {' '}
                        — {t('notLive')}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <>
                    <strong>{office}</strong> — {t('matchesNothing')}
                  </>
                )}
              </span>
              <button
                type="button"
                className="office-picker__x"
                onClick={() => setValue(withoutOffice(current, office))}
                aria-label={`${t('remove')} ${k?.name ?? office}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="office-picker__row">
        <label htmlFor={`${id}-dept`}>{t('addDepartment')}</label>
        <select
          id={`${id}-dept`}
          value=""
          disabled={state === 'loading'}
          onChange={(e) => {
            if (e.target.value) setValue(withOffice(current, e.target.value))
          }}
        >
          <option value="">{state === 'loading' ? t('loading') : t('choose')}</option>
          {choices.map((o, i) => (
            <option key={`${o.office}-${i}`} value={o.office} disabled={Boolean(o.disabledReason)}>
              {o.name}
              {o.disabledReason ? ` (${t('unsetNote')})` : ''}
            </option>
          ))}
        </select>
      </div>
      {state === 'failed' ? <p className="office-picker__none">{t('failed')}</p> : null}

      {isAdmin ? (
        <div className="office-picker__row">
          <label htmlFor={`${id}-name`}>{t('addByName')}</label>
          <span className="office-picker__inline">
            <input
              id={`${id}-name`}
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  setValue(withOffice(current, typed))
                  setTyped('')
                }
              }}
            />
            <button
              type="button"
              className="office-picker__add"
              disabled={normalizeOffice(typed) === ''}
              onClick={() => {
                setValue(withOffice(current, typed))
                setTyped('')
              }}
            >
              {t('add')}
            </button>
          </span>
        </div>
      ) : null}
    </div>
  )
}
