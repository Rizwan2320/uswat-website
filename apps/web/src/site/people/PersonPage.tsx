import PageHeader from '../components/kit/PageHeader'
import { T } from '../components/I18n'
import { departmentHref } from '../organisation/shape'
import { SampleNote } from '../organisation/SamplePill'

import styles from './People.module.css'
import { PEOPLE_PATH, initialsOf, type PersonProfile } from './shape'

/* One public profile: what the person wrote in the faculty portal and had approved. Nothing private is read here: the email
   and photo are absent from the record unless the person made them public. */
export default function PersonPage({ person: p }: { person: PersonProfile }) {
  return (
    <>
      <PageHeader
        title={p.name}
        lede={p.designation ?? undefined}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'People', href: PEOPLE_PATH }, { label: p.name }]}
      />
      <div className="container">
        <div className={styles.page}>
          <aside className={styles.side} aria-label="Contact and links">
            <div className={styles.portrait} aria-hidden={p.photo ? undefined : true}>
              {p.photo ? <img src={p.photo.src} alt={p.photo.alt} width={240} height={300} decoding="async" /> : initialsOf(p.name)}
            </div>
            <dl className={styles.facts}>
              {p.departmentName ? (
                <div>
                  <dt><T k="Department" /></dt>
                  <dd>{p.departmentSlug ? <a href={departmentHref(p.departmentSlug)}>{p.departmentName}</a> : p.departmentName}</dd>
                </div>
              ) : null}
              {p.office ? (
                <div>
                  <dt><T k="Office" /></dt>
                  <dd>{p.office}</dd>
                </div>
              ) : null}
              {p.email ? (
                <div>
                  <dt><T k="Email" /></dt>
                  <dd>{p.emailHref ? <a href={p.emailHref}>{p.email}</a> : p.email}</dd>
                </div>
              ) : null}
              {p.cvHref ? (
                <div>
                  <dt><T k="CV" /></dt>
                  <dd><a href={p.cvHref} rel="noopener noreferrer">Open the CV</a></dd>
                </div>
              ) : null}
            </dl>
          </aside>
          <div>
            {p.sample ? <SampleNote /> : null}
            {p.status !== 'current' ? (
              <p className={styles.notice} role="note">
                {p.status === 'emeritus' ? 'Emeritus faculty.' : 'Former faculty. This profile is kept for reference.'}
              </p>
            ) : null}
            <section className={styles.section} aria-labelledby="about">
              <h2 id="about" className={styles.heading}><T k="About" /></h2>
              {p.about.length ? (
                <div className={styles.text}>{p.about.map((t, i) => <p key={i}>{t}</p>)}</div>
              ) : (
                <p><T k="This person has not added an introduction yet." /></p>
              )}
            </section>
            {p.publications.length ? (
              <section className={styles.section} aria-labelledby="pubs">
                <h2 id="pubs" className={styles.heading}><T k="Publications" /></h2>
                <ul className={styles.links}>
                  {p.publications.map((x) => (
                    <li key={x.key}>{x.href ? <a href={x.href} rel="noopener noreferrer">{x.title}</a> : x.title}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <a className={styles.back} href={PEOPLE_PATH}><T k="All people" /></a>
          </div>
        </div>
      </div>
    </>
  )
}
