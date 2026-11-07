import { getStats } from '../lib/content'
import CountUp from './CountUp'
import { CapIcon, PeopleIcon, PersonIcon, TrophyIcon } from './icons'
import styles from './StatsCard.module.css'

const icons = { cap: CapIcon, people: PeopleIcon, person: PersonIcon, trophy: TrophyIcon }

/* Ivory card overlapping the hero bottom by ~50px. Server component; only CountUp is client.
   Numbers are the mockup's SAMPLE figures, so the card says so until verified values replace them. */
export default async function StatsCard() {
  const stats = await getStats()
  const anySample = stats.some((s) => s.sample)
  return (
    <section className={styles.wrap} aria-label="University at a glance">
      <div className="container">
        <ul className={`${styles.card} pop on-light`}>
          {stats.map((s) => {
            const Icon = icons[s.icon]
            return (
              <li key={s.id} className={styles.stat}>
                <Icon className={styles.icon} />
                <p className={styles.number}>
                  <CountUp value={s.value} suffix={s.suffix} label={s.label} />
                </p>
                <p className={styles.label} aria-hidden="true">{s.label}</p>
              </li>
            )
          })}
        </ul>
        {anySample ? (
          <p className={styles.note}>
            <span className="sample-tag">Sample</span> Figures are placeholders pending confirmation from the university.
          </p>
        ) : null}
      </div>
    </section>
  )
}
