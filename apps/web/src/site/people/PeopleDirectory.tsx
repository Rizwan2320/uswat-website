import PageHeader from '../components/kit/PageHeader'
import { T } from '../components/I18n'
import { SamplePill } from '../organisation/SamplePill'
import { groupBy } from '../organisation/shape'

import styles from './People.module.css'
import { NO_DEPARTMENT, PEOPLE_PATH, initialsOf, personHref, type Filters, type PersonCard } from './shape'

/* T7 directory (plan route 9): current people with a published record, grouped by department. The filters are a plain GET form,
   so they work without scripts and every result is a shareable address. */

export function Avatar({ p }: { p: PersonCard }) {
  return (
    <span className={styles.avatar} aria-hidden={p.photo ? undefined : true}>
      {p.photo ? <img src={p.photo.src} alt="" loading="lazy" decoding="async" width={64} height={64} /> : initialsOf(p.name)}
    </span>
  )
}

export default function PeopleDirectory({
  people,
  departments,
  filters,
  total,
}: {
  people: PersonCard[]
  departments: { slug: string; name: string }[]
  filters: Filters
  total: number
}) {
  const groups = groupBy(people, (p) => (p.departmentSlug && p.departmentName ? { id: p.departmentSlug, label: p.departmentName } : NO_DEPARTMENT))
  const filtered = Boolean(filters.q || filters.department)
  return (
    <>
      <PageHeader
        title="Faculty and staff"
        lede="Public profiles of the university's faculty, as written by each person and approved by their department."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'People' }]}
      />
      <div className="container">
        <div className={styles.wrap}>
          <form className={styles.filters} method="get" action={PEOPLE_PATH} role="search" aria-label="Find a person">
            <div className={styles.field}>
              <label htmlFor="people-q"><T k="Name" /></label>
              <input id="people-q" name="q" type="search" defaultValue={filters.q} maxLength={60} autoComplete="off" />
            </div>
            <div className={styles.field}>
              <label htmlFor="people-dept"><T k="Department" /></label>
              <select id="people-dept" name="department" defaultValue={filters.department ?? ''}>
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className={styles.button}><T k="Search" /></button>
            {filtered ? <a className={styles.clear} href={PEOPLE_PATH}><T k="Clear" /></a> : null}
          </form>
          <p className={styles.count} role="status">
            {filtered ? `${people.length} of ${total} people` : `${total} ${total === 1 ? 'person' : 'people'}`}
          </p>
          {groups.length === 0 ? (
            <p className={styles.empty}>
              <T k={filtered ? 'No one matches. Try fewer letters or all departments.' : 'No profiles are published yet.'} />
            </p>
          ) : (
            groups.map((g) => (
              <section key={g.id} className={styles.group} aria-labelledby={`p-${g.id}`}>
                <h2 id={`p-${g.id}`} className={styles.groupTitle}>{g.label}</h2>
                <ul className={styles.grid}>
                  {g.items.map((p) => (
                    <li key={p.id} className={styles.card}>
                      <Avatar p={p} />
                      <div className={styles.who}>
                        <h3 className={styles.name}>
                          <a className={styles.nameLink} href={personHref(p.slug)}>{p.name}</a>
                        </h3>
                        {p.designation ? <p className={styles.role}>{p.designation}</p> : null}
                        {p.sample ? <SamplePill /> : null}
                      </div>
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
