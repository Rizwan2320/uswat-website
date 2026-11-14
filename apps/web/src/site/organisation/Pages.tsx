import { safeHref } from '@/utilities/safeHref'

import { T } from '../components/I18n'
import PageHeader from '../components/kit/PageHeader'

import { ProgrammeMeta } from './Lists'
import styles from './Organisation.module.css'
import { SampleNote, SamplePill } from './SamplePill'
import type { PersonCard } from './queries'
import { DEPARTMENTS_PATH, PROGRAMMES_PATH, departmentHref, isSample, paragraphs, programmeHref, rel, str, type Doc, type ProgrammeCard } from './shape'

const Text = ({ text }: { text: unknown }) => (
  <div className={styles.text}>
    {paragraphs(text).map((p) => (
      <p key={p}>{p}</p>
    ))}
  </div>
)

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section aria-labelledby={id}>
    <h2 id={id} className={styles.heading}>
      <T k={title} />
    </h2>
    {children}
  </section>
)

/* T3: one department. Overview, programmes, people and contact. News is not shown: nothing links a post to a department yet. */
export function DepartmentPage({ doc, programmes, people }: { doc: Doc; programmes: ProgrammeCard[]; people: PersonCard[] }) {
  const name = str(doc.name) ?? ''
  const group = rel(doc.facultyGroup)
  const head = rel(doc.head)
  const emails = (Array.isArray(doc.emails) ? doc.emails : []).flatMap((e) => (str((e as Doc).email) ? [str((e as Doc).email)!] : []))
  const documents = (Array.isArray(doc.documents) ? doc.documents : []).flatMap((d) => {
    const href = safeHref(str((d as Doc).url))
    const label = str((d as Doc).label)
    return href && label ? [{ href, label, key: String((d as Doc).id ?? href) }] : []
  })
  return (
    <>
      <PageHeader
        title={name}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Academics', href: '/academics' }, { label: 'Departments', href: DEPARTMENTS_PATH }, { label: name }]}
      />
      <article className="container">
        <div className={styles.page}>
          {isSample(doc) ? <SampleNote /> : null}
          <dl className={styles.facts}>
            {group && str(group.name) ? (
              <div>
                <dt><T k="Faculty group" /></dt>
                <dd>{str(group.name)}</dd>
              </div>
            ) : null}
            {head && str(head.name) ? (
              <div>
                <dt><T k="Head of department" /></dt>
                <dd>
                  {str(head.name)}
                  {str(head.designation) ? `, ${str(head.designation)}` : ''}
                </dd>
              </div>
            ) : null}
          </dl>
          {str(doc.summary) ? (
            <Section id="overview" title="Overview">
              <Text text={doc.summary} />
            </Section>
          ) : null}
          {str(doc.vision) ? (
            <Section id="vision" title="Vision">
              <Text text={doc.vision} />
            </Section>
          ) : null}
          {str(doc.mission) ? (
            <Section id="mission" title="Mission">
              <Text text={doc.mission} />
            </Section>
          ) : null}
          <Section id="programmes" title="Programmes">
            {programmes.length ? (
              <ul className={styles.grid}>
                {programmes.map((p) => (
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
            ) : (
              <p className={styles.empty}><T k="No programmes are listed for this department yet." /></p>
            )}
          </Section>
          <Section id="people" title="People">
            {people.length ? (
              <ul className={styles.people}>
                {people.map((p) => (
                  <li key={p.id} className={styles.person}>
                    <span className={styles.personName}>{p.name}</span>
                    {p.designation ? <span className={styles.personRole}>{p.designation}</span> : null}
                    {p.email && safeHref(`mailto:${p.email}`) ? <a href={`mailto:${p.email}`}>{p.email}</a> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}><T k="No people are listed for this department yet." /></p>
            )}
          </Section>
          {emails.length || documents.length ? (
            <Section id="contact" title="Contact and documents">
              <ul className={styles.links}>
                {emails.map((e) => (
                  <li key={e}>
                    <a href={`mailto:${e}`}>{e}</a>
                  </li>
                ))}
                {documents.map((d) => (
                  <li key={d.key}>
                    <a href={d.href} rel="noopener noreferrer">
                      {d.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      </article>
    </>
  )
}

/* T4: one programme. Level, duration, eligibility and the fee link. There is no apply-link field in the CMS yet, so none is shown. */
export function ProgrammePage({ doc }: { doc: Doc }) {
  const name = str(doc.name) ?? ''
  const dept = rel(doc.department)
  const campus = rel(doc.campus)
  const fee = safeHref(str(doc.feeLink))
  const curriculum = safeHref(str(doc.curriculumUrl))
  const rows: [string, string | null][] = [
    ['Level', str(doc.level)],
    ['Duration', str(doc.duration)],
    ['Department', str(dept?.name)],
    ['Campus', str(campus?.name)],
  ]
  return (
    <>
      <PageHeader
        title={name}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Academics', href: '/academics' }, { label: 'Programmes', href: PROGRAMMES_PATH }, { label: name }]}
      />
      <article className="container">
        <div className={styles.page}>
          {isSample(doc) ? <SampleNote /> : null}
          <dl className={styles.facts}>
            {rows.map(([label, value]) =>
              value ? (
                <div key={label}>
                  <dt><T k={label} /></dt>
                  <dd>
                    {label === 'Department' && dept && str(dept.slug) ? <a href={departmentHref(str(dept.slug)!)}>{value}</a> : value}
                  </dd>
                </div>
              ) : null,
            )}
          </dl>
          {str(doc.eligibility) ? (
            <Section id="eligibility" title="Eligibility">
              <Text text={doc.eligibility} />
            </Section>
          ) : null}
          {fee || curriculum ? (
            <Section id="links" title="Fees and curriculum">
              <ul className={styles.links}>
                {fee ? (
                  <li>
                    <a href={fee} rel="noopener noreferrer"><T k="Fee information" /></a>
                  </li>
                ) : null}
                {curriculum ? (
                  <li>
                    <a href={curriculum} rel="noopener noreferrer"><T k="Curriculum (PDF)" /></a>
                  </li>
                ) : null}
              </ul>
            </Section>
          ) : null}
        </div>
      </article>
    </>
  )
}
