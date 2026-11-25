import { site } from '../content/site'
import PageHeader from '../components/kit/PageHeader'
import { T } from '../components/I18n'

import styles from './People.module.css'
import PeopleBrowser from './PeopleBrowser'
import type { Area } from './browse'
import type { PersonCard } from './shape'

/* The Faculty Portal link on the public site opens this page (owner, 2026-11-24): everyone's public profile, with the
   sign-in for faculty and staff in the band at the top and again at the foot. */
export const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

export default function PeopleDirectory({ people, areas, initialQuery, initialArea }: { people: PersonCard[]; areas: Area[]; initialQuery: string; initialArea: string }) {
  return (
    <>
      <PageHeader
        title="Faculty and staff"
        lede="Public profiles of the university's faculty and staff, written by each person and approved by their department."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Faculty portal' }]}
      >
        <div className={styles.signin}>
          <a className={styles.signinBtn} href={site.portalLinks.facultySignIn} rel="noopener noreferrer">
            <UserIcon />
            <T k="Faculty sign in" />
          </a>
          <p className={styles.signinNote}><T k="For faculty and staff: update your page, publications and courses." /></p>
        </div>
      </PageHeader>
      <PeopleBrowser people={people} areas={areas} initialQuery={initialQuery} initialArea={initialArea} />
      <div className="container">
        <aside className={styles.strip} aria-label="Sign in">
          <p><T k="Is your profile missing or out of date? Sign in to the faculty portal to update it." /></p>
          <a className={styles.stripBtn} href={site.portalLinks.facultySignIn} rel="noopener noreferrer"><T k="Faculty sign in" /></a>
        </aside>
      </div>
    </>
  )
}
