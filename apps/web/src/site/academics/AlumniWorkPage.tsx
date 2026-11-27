import { programmeHref } from '../organisation/shape'

import styles from './Academics.module.css'
import { AlumniPortrait } from './Alumni'
import { alumniForProgramme, alumniHref, type AlumniWork } from './alumni'
import { Band, Chips, SiteLink } from './blocks'
import { profileForDiscipline } from './profiles'

/* /academics/alumni-work/<slug>: the page a card on the alumni band opens. It holds the summary of the work and, when the work has a
   public address, a button to the full text. */
export default function AlumniWorkPage({ work }: { work: AlumniWork }) {
  const programme = profileForDiscipline(work.programme)
  const others = alumniForProgramme(work.programme).filter((w) => w.slug !== work.slug)
  return (
    <div className={styles.root}>
      <header className={styles.workHero}>
        <div className="container">
          <p className={styles.workHeroKicker}>{work.kind}</p>
          <h1 className={styles.workHeroTitle}>{work.headline}</h1>
          <p className={styles.workHeroMeta}>
            {work.name}, class of {work.classOf}
            {programme ? `, BS ${programme.shortName}` : ''}
          </p>
        </div>
      </header>
      <Band id="work" kicker="About the work" title="Summary">
        <div className={styles.workGrid}>
          <div className={styles.workPortrait}>
            <AlumniPortrait work={work} sizes="(max-width: 700px) 60vw, 240px" />
          </div>
          <div>
            <p className={styles.alumniNote}>
              <span className="sample-tag" style={{ marginInlineStart: 0 }}>
                Sample
              </span>
              Example entry until the department adds real alumni work.
            </p>
            <div className={styles.prose}>
              <p>{work.summary}</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <Chips items={work.tags} />
            </div>
            <div className={styles.workFacts}>
              {work.workUrl ? (
                <SiteLink href={work.workUrl} className={styles.btn}>
                  Read the full work
                </SiteLink>
              ) : null}
              <SiteLink href={programmeHref(work.programme)} className={styles.workBack}>
                Back to {programme?.shortName ?? 'the programme'}
              </SiteLink>
            </div>
          </div>
        </div>
      </Band>
      {others.length ? (
        <Band id="more" tint kicker="More from the programme" title="Other alumni work">
          <ul className={styles.workOthers}>
            {others.map((w) => (
              <li key={w.slug}>
                <h3 className={styles.cardTitle}>
                  <SiteLink href={alumniHref(w.slug)}>{w.headline}</SiteLink>
                </h3>
                <p className={styles.cardText}>
                  {w.name}, class of {w.classOf}
                </p>
              </li>
            ))}
          </ul>
        </Band>
      ) : null}
    </div>
  )
}
