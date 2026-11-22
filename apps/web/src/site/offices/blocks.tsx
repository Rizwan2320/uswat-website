import { initials, SiteLink } from '../academics/blocks'

import styles from './Offices.module.css'
import type { Milestone, OfficePerson, OfficePhone, Source } from './types'

/* Blocks for the office pages. Frame, bands, cards and the news feed are the department page's own (../academics/blocks). */

export function PeopleCards({ people }: { people: OfficePerson[] }) {
  return (
    <ul className={styles.people}>
      {people.map((p) => (
        <li key={p.id} className={styles.person}>
          <span className={styles.initials} aria-hidden="true">
            {initials(p.name)}
          </span>
          <div>
            <h3 className={styles.personName}>{p.name}</h3>
            <p className={styles.personTitle}>{p.title}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`

export function ContactList({
  address,
  phones,
  emails,
  hours,
}: {
  address?: string
  phones?: OfficePhone[]
  emails?: string[]
  hours?: string
}) {
  return (
    <dl className={styles.contact}>
      {address ? (
        <div className={styles.contactItem}>
          <dt>Address</dt>
          <dd>{address}</dd>
        </div>
      ) : null}
      {phones?.length ? (
        <div className={styles.contactItem}>
          <dt>Telephone</dt>
          <dd>
            {phones.map((p) => (
              <span key={p.number}>
                {p.label ? `${p.label}: ` : ''}
                <a href={telHref(p.number)}>{p.number}</a>
              </span>
            ))}
          </dd>
        </div>
      ) : null}
      {emails?.length ? (
        <div className={styles.contactItem}>
          <dt>E-mail</dt>
          <dd>
            {emails.map((e) => (
              <a key={e} href={`mailto:${e}`}>
                {e}
              </a>
            ))}
          </dd>
        </div>
      ) : null}
      {hours ? (
        <div className={styles.contactItem}>
          <dt>Office hours</dt>
          <dd>{hours}</dd>
        </div>
      ) : null}
    </dl>
  )
}

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export function Milestones({ items }: { items: Milestone[] }) {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <ol className={styles.timeline}>
      {sorted.map((m) => (
        <li key={`${m.date}-${m.title}`}>
          <time dateTime={m.date}>{longDate(m.date)}</time>
          <span>{m.title}</span>
        </li>
      ))}
    </ol>
  )
}

/** Every page ends with where its facts come from and the day they were read (CLAUDE.md rule 3). */
export function Sources({ sources, verifiedAt, openPoints }: { sources: Source[]; verifiedAt: string; openPoints?: string[] }) {
  return (
    <div className={styles.sources}>
      <p>
        The facts on this page were read from the university’s own pages on {longDate(verifiedAt)}. Please confirm with the office before
        relying on them.
      </p>
      <ul>
        {sources.map((s) => (
          <li key={s.url}>
            <SiteLink href={s.url}>{s.label}</SiteLink>
          </li>
        ))}
      </ul>
      {openPoints?.length ? (
        <>
          <h3 className={styles.openTitle}>Still to be confirmed</h3>
          <ul>
            {openPoints.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
