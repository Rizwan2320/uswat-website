import { safeHref } from '@/utilities/safeHref'

import { T } from '../components/I18n'
import PageHeader from '../components/kit/PageHeader'

import { DepartmentGroups, ProgrammeMeta } from './Lists'
import styles from './Organisation.module.css'
import { SampleNote, SamplePill } from './SamplePill'
import { Section, Text } from './Pages'
import { PROGRAMMES_PATH, isSample, programmeHref, str, type DepartmentCard, type Doc, type ProgrammeCard } from './shape'

/* T2 Academics landing: every published department under its faculty group, and the way on to all programmes.
   The old department addresses that have no page of their own redirect here (route map). */
export function AcademicsPage({ departments }: { departments: DepartmentCard[] }) {
  return (
    <>
      <PageHeader title="Academics" crumbs={[{ label: 'Home', href: '/' }, { label: 'Academics' }]} />
      <div className="container">
        <div className={styles.wrap}>
          <DepartmentGroups departments={departments} />
          <p>
            <a className={styles.cardLink} style={{ position: 'static' }} href={PROGRAMMES_PATH}>
              <T k="See all programmes" />
            </a>
          </p>
        </div>
      </div>
    </>
  )
}

/* T2 campus page: name, address and link only when the Registrar has entered them, and the programmes taught there. */
export function CampusPage({ doc, programmes }: { doc: Doc; programmes: ProgrammeCard[] }) {
  const name = str(doc.name) ?? ''
  const link = safeHref(str(doc.link))
  return (
    <>
      <PageHeader title={name} crumbs={[{ label: 'Home', href: '/' }, { label: 'Campuses' }, { label: name }]} />
      <article className="container">
        <div className={styles.page}>
          {isSample(doc) ? <SampleNote /> : null}
          {str(doc.address) ? (
            <Section id="address" title="Address">
              <Text text={doc.address} />
            </Section>
          ) : null}
          {link ? (
            <p>
              <a href={link} rel="noopener noreferrer">
                <T k="Map or web page" />
              </a>
            </p>
          ) : null}
          <Section id="programmes" title="Programmes at this campus">
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
              <p className={styles.empty}>
                <T k="No programmes are listed for this campus yet." />
              </p>
            )}
          </Section>
        </div>
      </article>
    </>
  )
}
