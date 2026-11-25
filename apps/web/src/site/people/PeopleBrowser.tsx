'use client'

import { useId, useMemo, useState } from 'react'

import { CloseIcon, SearchIcon } from '../components/icons'

import styles from './People.module.css'
import { PEOPLE_PATH, filterAreas, filterPeople, initialsOf, peopleInArea, personHref, toneOf, type Area } from './browse'
import type { PersonCard } from './shape'

/* The directory has two ways in, as two buttons: search by name, or pick a department or programme and see its faculty.
   The server renders the list already narrowed by `?q=` or `?area=` (so it works without scripts, and a result is a shareable
   address); in the browser the list narrows as you type. A programme has no people of its own: its faculty are its department's. */
const TONES = [styles.tone0, styles.tone1, styles.tone2] as const
type Mode = 'name' | 'area'

function Card({ p }: { p: PersonCard }) {
  return (
    <li className={styles.card}>
      {p.sample ? <span className={styles.pill}>Sample</span> : null}
      <div className={`${styles.tile} ${TONES[toneOf(p.slug)]}`} style={{ fontSize: '3rem' }} aria-hidden={p.photo ? undefined : true}>
        {p.photo ? <img src={p.photo.src} alt="" loading="lazy" decoding="async" width={420} height={420} /> : initialsOf(p.name)}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.name}>
          <a className={styles.nameLink} href={personHref(p.slug)}>{p.name}</a>
        </h3>
        {p.designation ? <p className={styles.role}>{p.designation}</p> : null}
        {p.departmentName ? <p className={styles.dept}>{p.departmentName}</p> : null}
      </div>
    </li>
  )
}

const addressOf = (mode: Mode, q: string, area: string) => {
  const v = q.trim().slice(0, 60)
  if (mode === 'area') return area ? `${PEOPLE_PATH}?area=${encodeURIComponent(area)}` : PEOPLE_PATH
  return v ? `${PEOPLE_PATH}?q=${encodeURIComponent(v)}` : PEOPLE_PATH
}

export default function PeopleBrowser({ people, areas, initialQuery, initialArea }: { people: PersonCard[]; areas: Area[]; initialQuery: string; initialArea: string }) {
  const [mode, setMode] = useState<Mode>(initialArea ? 'area' : 'name')
  const [q, setQ] = useState(initialQuery)
  const [areaText, setAreaText] = useState('')
  const [areaId, setAreaId] = useState(initialArea)
  const id = useId()

  const area = areas.find((a) => a.id === areaId) ?? null
  const byName = useMemo(() => filterPeople(people, { q }), [people, q])
  const options = useMemo(() => filterAreas(areas, areaText), [areas, areaText])
  const inArea = useMemo(() => (area ? peopleInArea(people, area) : []), [people, area])
  const countOf = (a: Area) => peopleInArea(people, a).length

  const pushUrl = (m: Mode, nq: string, na: string) => window.history.replaceState(null, '', addressOf(m, nq, na))
  const switchMode = (m: Mode) => {
    setMode(m)
    pushUrl(m, q, areaId)
  }
  const changeName = (v: string) => {
    setQ(v)
    pushUrl('name', v, areaId)
  }
  const pick = (a: Area | null) => {
    setAreaId(a?.id ?? '')
    setAreaText('')
    pushUrl('area', q, a?.id ?? '')
  }

  const searching = q.trim().length > 0
  const shown = mode === 'name' ? byName : inArea

  return (
    <>
      <div className={`container ${styles.finder}`}>
        <div className={styles.modes} role="group" aria-label="How to find a person">
          <button type="button" className={styles.mode} aria-pressed={mode === 'name'} onClick={() => switchMode('name')}>
            <SearchIcon aria-hidden="true" /> Search by name
          </button>
          <button type="button" className={styles.mode} aria-pressed={mode === 'area'} onClick={() => switchMode('area')}>
            <SearchIcon aria-hidden="true" /> Department or programme
          </button>
        </div>

        {mode === 'name' ? (
          <form className={styles.search} method="get" action={PEOPLE_PATH} role="search" aria-label="Find a person by name" onSubmit={(e) => e.preventDefault()}>
            <SearchIcon aria-hidden="true" />
            <label htmlFor={`${id}-name`} className="sr-only">Search by name</label>
            <input id={`${id}-name`} name="q" type="search" value={q} maxLength={60} autoComplete="off" placeholder="Type a name" onChange={(e) => changeName(e.target.value)} />
            {searching ? (
              <button type="button" className={styles.clearBtn} aria-label="Clear the search" onClick={() => changeName('')}>
                <CloseIcon aria-hidden="true" />
              </button>
            ) : null}
            <noscript>
              <button type="submit" className={styles.searchBtn}>Search</button>
            </noscript>
          </form>
        ) : (
          <div className={styles.areaBox}>
            {area ? (
              <div className={styles.picked}>
                <p>
                  <strong>{area.label}</strong>
                  {area.kind === 'programme' && area.departmentName ? <span> is taught in {area.departmentName}. Showing that department&apos;s faculty.</span> : <span> · department</span>}
                </p>
                <button type="button" className={styles.changeBtn} onClick={() => pick(null)}>Choose another</button>
              </div>
            ) : (
              <>
                <div className={styles.search} role="search" aria-label="Find a department or programme">
                  <SearchIcon aria-hidden="true" />
                  <label htmlFor={`${id}-area`} className="sr-only">Department or programme</label>
                  <input id={`${id}-area`} type="search" value={areaText} maxLength={60} autoComplete="off" placeholder="Type a department or programme, e.g. Computer, Physics, BS" onChange={(e) => setAreaText(e.target.value)} />
                  {areaText ? (
                    <button type="button" className={styles.clearBtn} aria-label="Clear the search" onClick={() => setAreaText('')}>
                      <CloseIcon aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
                {options.length === 0 ? (
                  <p className={styles.empty}>No department or programme matches that. Try fewer letters.</p>
                ) : (
                  <ul className={styles.options} aria-label="Departments and programmes">
                    {options.slice(0, 40).map((a) => (
                      <li key={a.id}>
                        <button type="button" className={styles.option} onClick={() => pick(a)}>
                          <span className={styles.optName}>{a.label}</span>
                          <span className={styles.optMeta}>
                            {a.kind === 'department' ? 'Department' : `Programme${a.departmentName ? ` · ${a.departmentName}` : ''}`} · {countOf(a)} {countOf(a) === 1 ? 'person' : 'people'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {mode === 'name' || area ? (
          <p className={styles.count} role="status" aria-live="polite">
            {mode === 'name'
              ? searching ? `${shown.length} of ${people.length} people` : `${people.length} ${people.length === 1 ? 'person' : 'people'}`
              : `${shown.length} ${shown.length === 1 ? 'person' : 'people'}`}
          </p>
        ) : null}
      </div>

      {mode === 'name' || area ? (
        <div className="container">
          <div className={styles.wrap}>
            {shown.length === 0 ? (
              <p className={styles.empty}>
                {mode === 'name'
                  ? searching ? 'No one matches that name. Try fewer letters.' : 'No profiles are published yet.'
                  : 'No faculty are listed for this yet.'}
              </p>
            ) : (
              <ul className={styles.grid}>
                {shown.map((p) => <Card key={p.id} p={p} />)}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.wrap} />
      )}
    </>
  )
}
