import { getAdmissions } from '../lib/content'
import { getAdmissionsState } from '../lib/admissions'
import { ArrowRightIcon, GroupIcon, MegaphoneIcon } from './icons'
import styles from './AdmissionsBanner.module.css'

/* Three-zone forest bar. Open/closed is decided on the server from the deadline (Home page content, or content/admissions.ts when empty);
   the page revalidates every five minutes, so the state flips soon after the deadline. */
export default async function AdmissionsBanner() {
  const admissions = await getAdmissions()
  const state = getAdmissionsState(admissions)
  return (
    <section className={styles.wrap} aria-labelledby="admissions-title">
      <div className="container">
        <div className={styles.bar}>
          <div className={styles.zone}>
            <MegaphoneIcon className={styles.icon} />
            <div>
              <h2 id="admissions-title" className={styles.headline}>{state.headline}</h2>
              <p className={styles.detail}>{state.detail}</p>
            </div>
          </div>
          <div className={`${styles.zone} ${styles.mid}`}>
            <GroupIcon className={styles.icon} />
            <div>
              <p className={styles.headline2}>{admissions.servicesHeading}</p>
              <p className={styles.detail}>{admissions.levels.join(' · ')}</p>
            </div>
          </div>
          <a className={`btn btn--gold ${styles.cta}`} href={state.ctaHref} rel="noopener noreferrer">
            {state.ctaLabel} <ArrowRightIcon className="btn-arrow" />
          </a>
        </div>
      </div>
    </section>
  )
}
