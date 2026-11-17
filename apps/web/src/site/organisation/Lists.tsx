import PageHeader from '../components/kit/PageHeader'
import { T } from '../components/I18n'

import styles from './Organisation.module.css'
import { SamplePill } from './SamplePill'
import { departmentHref, groupBy, programmeHref, type DepartmentCard, type ProgrammeCard } from './shape'

/* T3 index (departments, grouped by faculty group) and the programmes index (grouped by department). */

export function DepartmentsIndex({ departments }: { departments: DepartmentCard[] }) {
  const groups = groupBy(departments, (d) => ({ id: d.groupId, label: d.groupName }))
  return (
    <>
      <PageHeader title="Departments" crumbs={[{ label: 'Home', href: '/' }, { label: 'Academics', href: '/academics' }, { label: 'Departments' }]} />
      <div className="container">
        <div className={styles.wrap}>
          {groups.length === 0 ? (
            <p className={styles.empty}>
              <T k="No departments are published yet." />
            </p>
          ) : (
            groups.map((g) => (
              <section key={g.id} className={styles.group} aria-labelledby={`g-${g.id}`}>
                <h2 id={`g-${g.id}`} className={styles.groupTitle}>
                  {g.label}
                </h2>
                <ul className={styles.grid}>
                  {g.items.map((d) => (
                    <li key={d.id} className={styles.card}>
                      <h3 className={styles.cardTitle}>
                        <a className={styles.cardLink} href={departmentHref(d.slug)}>
                          {d.name}
                        </a>
                      </h3>
                      {d.summary ? <p className={styles.excerpt}>{d.summary}</p> : null}
                      {d.sample ? <SamplePill /> : null}
                    </li>
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

export function ProgrammesIndex({ programmes }: { programmes: ProgrammeCard[] }) {
  const groups = groupBy(programmes, (p) => ({ id: p.departmentId, label: p.departmentName }))
  return (
    <>
      <PageHeader title="Programmes" crumbs={[{ label: 'Home', href: '/' }, { label: 'Academics', href: '/academics' }, { label: 'Programmes' }]} />
      <div className="container">
        <div className={styles.wrap}>
          {groups.length === 0 ? (
            <p className={styles.empty}>
              <T k="No programmes are published yet." />
            </p>
          ) : (
            groups.map((g) => (
              <section key={g.id} className={styles.group} aria-labelledby={`p-${g.id}`}>
                <h2 id={`p-${g.id}`} className={styles.groupTitle}>
                  {g.label}
                </h2>
                <ul className={styles.grid}>
                  {g.items.map((p) => (
                    <li key={p.id} className={styles.card}>
                      <h3 className={styles.cardTitle}>
                        <a className={styles.cardLink} href={programmeHref(p.slug)}>
                          {p.name}
                        </a>
                      </h3>
                      <ProgrammeMeta p={p} />
                      {p.sample ? <SamplePill /> : null}
                    </li>
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

export function ProgrammeMeta({ p }: { p: ProgrammeCard }) {
  const bits = [p.level, p.duration, p.campus].filter((b): b is string => !!b)
  return bits.length ? (
    <ul className={styles.meta}>
      {bits.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  ) : null
}
