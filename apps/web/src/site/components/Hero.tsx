import { getHeroSlides } from '../lib/content'
import HeroCarousel from './HeroCarousel'
import styles from './Hero.module.css'

/* Hero section shell (server). The carousel behaviour lives in HeroCarousel (client). The bottom wave is inline SVG. */
export default async function Hero() {
  const slides = await getHeroSlides()
  return (
    <section className={styles.hero} aria-label="Welcome" aria-roledescription="carousel">
      <HeroCarousel slides={slides} />
      <svg className={styles.wave} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 52C220 8 470 8 720 38s520 40 720-6V90H0Z" fill="var(--gold)" />
        <path d="M0 66C240 26 480 28 720 54s500 30 720-8V90H0Z" fill="var(--ivory)" />
      </svg>
    </section>
  )
}
