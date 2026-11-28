import { site } from '../content/site'
import PageHeader from '../components/kit/PageHeader'
import { T } from '../components/I18n'
import { departmentHref } from '../organisation/shape'
import { SampleNote } from '../organisation/SamplePill'

import styles from './People.module.css'
import { PEOPLE_PATH, initialsOf, toneOf } from './browse'
import type { PersonProfile } from './shape'

/* One public profile: what the person wrote in the faculty portal and had approved. Nothing private is read here: the email
   and photo are absent from the record unless the person made them public. */
const TONES = [styles.tone0, styles.tone1, styles.tone2] as const

export default function PersonPage({ person: p }: { person: PersonProfile }) {
  return (
    <>
      <PageHeader
        title={p.name}
        lede={[p.designation, p.departmentName].filter(Boolean).join(' · ') || undefined}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Faculty portal', href: PEOPLE_PATH }, { label: p.name }]}
      />
      <div className="container">
        <div className={styles.page}>
          <aside className={styles.side} aria-label="Details">
            <div className={styles.portrait}>
              {p.sample ? <span className={styles.pill}>Sample</span> : null}
              <div className={`${styles.tile} ${TONES[toneOf(p.slug)]}`} aria-hidden={p.photo ? undefined : true}>
                {p.photo ? <img src={p.photo.src} alt={p.photo.alt} width={300} height={300} decoding="async" /> : initialsOf(p.name)}
              </div>
            </div>
            <dl className={styles.facts}>
              {p.designation ? (
                <div>
                  <dt><T k="Designation" /></dt>
                  <dd>{p.designation}</dd>
                </div>
              ) : null}
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
              {p.officeNote ? (
                <div>
                  <dt><T k="Office location" /></dt>
                  <dd>{p.officeNote}</dd>
                </div>
              ) : null}
              {p.officeHours ? (
                <div>
                  <dt><T k="Office hours" /></dt>
                  <dd>{p.officeHours}</dd>
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
              {p.orcidHref ? (
                <div>
                  <dt>ORCID iD</dt>
                  <dd><a href={p.orcidHref} rel="noopener noreferrer">{p.orcid}</a></dd>
                </div>
              ) : null}
              {p.scholarHref ? (
                <div>
                  <dt><T k="Google Scholar" /></dt>
                  <dd><a href={p.scholarHref} rel="noopener noreferrer">Open the Scholar profile</a></dd>
                </div>
              ) : null}
            </dl>
          </aside>
          <div className={styles.main}>
            {p.sample ? <SampleNote /> : null}
            {p.status !== 'current' ? (
              <p className={styles.notice} role="note">
                {p.status === 'emeritus' ? 'Emeritus faculty.' : 'Former faculty. This profile is kept for reference.'}
              </p>
            ) : null}
            <section aria-labelledby="about">
              <h2 id="about" className={styles.heading}><T k="About" /></h2>
              {p.about.length ? (
                <div className={styles.text}>{p.about.map((t, i) => <p key={i}>{t}</p>)}</div>
              ) : (
                <p><T k="This person has not added an introduction yet." /></p>
              )}
            </section>
            {p.interests.length ? (
              <section aria-labelledby="interests">
                <h2 id="interests" className={styles.heading}><T k="Research interests" /></h2>
                <ul className={styles.interests}>
                  {p.interests.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </section>
            ) : null}
            {p.publications.length ? (
              <section aria-labelledby="pubs">
                <h2 id="pubs" className={styles.heading}><T k="Publications" /></h2>
                <ol className={styles.pubs}>
                  {p.publications.map((x) => (
                    <li key={x.key}>
                      {x.href ? <a href={x.href} rel="noopener noreferrer">{x.title}</a> : x.title}
                      {x.featured ? <span className={styles.featured}> Featured</span> : null}
                      {x.meta ? <span className={styles.pubMeta}>{x.meta}</span> : null}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
            <aside className={styles.strip} aria-label="Sign in">
              <p><T k="Is this your profile? Sign in to the faculty portal to update it." /></p>
              <a className={styles.stripBtn} href={site.portalLinks.facultySignIn} rel="noopener noreferrer"><T k="Faculty sign in" /></a>
            </aside>
            <a className={styles.back} href={PEOPLE_PATH}><T k="All faculty and staff" /></a>
          </div>
        </div>
      </div>
    </>
  )
}
