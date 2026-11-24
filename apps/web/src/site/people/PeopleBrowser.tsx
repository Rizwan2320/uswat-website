'use client'

import { useId, useMemo, useState } from 'react'

import { CloseIcon, SearchIcon } from '../components/icons'

import styles from './People.module.css'
import { PEOPLE_PATH, filterPeople, initialsOf, personHref, toneOf } from './browse'
import type { PersonCard } from './shape'

/* The searchable list. The server renders it already filtered by `?q=` (so it works without scripts, and a search is a
   shareable address); in the browser the list narrows as you type. Search is by name only. */
const TONES = [styles.tone0, styles.tone1, styles.tone2] as const

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

export default function PeopleBrowser({ people, initialQuery }: { people: PersonCard[]; initialQuery: string }) {
  const [q, setQ] = useState(initialQuery)
  const id = useId()
  const shown = useMemo(() => filterPeople(people, { q }), [people, q])
  const change = (v: string) => {
    setQ(v)
    const next = v.trim() ? `${PEOPLE_PATH}?q=${encodeURIComponent(v.trim().slice(0, 60))}` : PEOPLE_PATH
    window.history.replaceState(null, '', next)
  }
  const searching = q.trim().length > 0

  return (
    <>
      <div className={`container ${styles.finder}`}>
        <form className={styles.search} method="get" action={PEOPLE_PATH} role="search" aria-label="Find a person by name" onSubmit={(e) => e.preventDefault()}>
          <SearchIcon aria-hidden="true" />
          <label htmlFor={id} className="sr-only">Search by name</label>
          <input id={id} name="q" type="search" value={q} maxLength={60} autoComplete="off" placeholder="Search by name" onChange={(e) => change(e.target.value)} />
          {searching ? (
            <button type="button" className={styles.clearBtn} aria-label="Clear the search" onClick={() => change('')}>
              <CloseIcon aria-hidden="true" />
            </button>
          ) : null}
          <noscript>
            <button type="submit" className={styles.searchBtn}>Search</button>
          </noscript>
        </form>
        <p className={styles.count} role="status" aria-live="polite">
          {searching ? `${shown.length} of ${people.length} people` : `${people.length} ${people.length === 1 ? 'person' : 'people'}`}
        </p>
      </div>
      <div className="container">
        <div className={styles.wrap}>
          {shown.length === 0 ? (
            <p className={styles.empty}>{searching ? 'No one matches that name. Try fewer letters.' : 'No profiles are published yet.'}</p>
          ) : (
            <ul className={styles.grid}>
              {shown.map((p) => <Card key={p.id} p={p} />)}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
