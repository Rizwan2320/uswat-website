import PageHeader from '../components/kit/PageHeader'
import { T } from '../components/I18n'
import styles from '../organisation/Organisation.module.css'
import { SampleNote, SamplePill } from '../organisation/SamplePill'

import { groupBySection, type ContactEntry } from './shape'

/* T7 directory: published entries under their section heading. */

function Entry({ e }: { e: ContactEntry }) {
  return (
    <li className={styles.card}>
      <h3 className={styles.cardTitle}>{e.name}</h3>
      {e.hours ? (
        <p className={styles.excerpt}>
          <T k="Hours" />: {e.hours}
        </p>
      ) : null}
      {e.phones.length > 0 || e.email ? (
        <ul className={styles.contacts}>
          {e.phones.map((p) => (
            <li key={p.text} dir="ltr">
              {p.href ? <a href={p.href}>{p.text}</a> : p.text}
            </li>
          ))}
          {e.email ? <li dir="ltr">{e.emailHref ? <a href={e.emailHref}>{e.email}</a> : e.email}</li> : null}
        </ul>
      ) : null}
      {e.sample ? <SamplePill /> : null}
    </li>
  )
}

export default function Directory({ entries }: { entries: ContactEntry[] }) {
  const groups = groupBySection(entries)
  return (
    <>
      <PageHeader title="Contact directory" crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact' }, { label: 'Directory' }]} />
      <div className="container">
        <div className={styles.wrap}>
          {entries.some((e) => e.sample) ? <SampleNote /> : null}
          {groups.length === 0 ? (
            <p className={styles.empty}>
              <T k="No directory entries are published yet." />
            </p>
          ) : (
            groups.map((g) => (
              <section key={g.id} className={styles.group} aria-labelledby={`d-${g.id}`}>
                <h2 id={`d-${g.id}`} className={styles.groupTitle}>
                  {g.section}
                </h2>
                <ul className={styles.grid}>
                  {g.entries.map((e) => (
                    <Entry key={e.id} e={e} />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  )
}
