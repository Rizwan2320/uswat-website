import { footerQuick, footerUseful } from '../content/nav'
import { getSite } from '../lib/content'
import { T } from './I18n'
import { FacebookIcon, LinkedinIcon, MailIcon, PhoneIcon, PinIcon, TiktokIcon, YoutubeIcon } from './icons'
import { Crest } from './Logo'
import NewsletterForm from './NewsletterForm'
import styles from './Footer.module.css'

const social = { facebook: FacebookIcon, youtube: YoutubeIcon, linkedin: LinkedinIcon, tiktok: TiktokIcon }

/* Five-column footer on forest-deep with a wavy top edge. Rendered on the server; the year comes from the server clock
   in the Pakistan zone, and the page revalidates hourly. Contact details are real (sourced) except the street address,
   which carries a visible Sample tag until the Odigram/Charbagh conflict is settled. */
export default async function Footer() {
  const site = await getSite()
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Asia/Karachi' }).format(new Date())
  return (
    <footer className={styles.footer}>
      <svg className={styles.wave} viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 0h1440v22C1200 62 960 58 720 34S240 8 0 38Z" fill="var(--ivory)" />
      </svg>
      <Trees className={styles.treesL} />
      <Trees className={styles.treesR} />

      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <p className={styles.brandRow}>
            <Crest size={48} />
            <span>
              <span className={styles.brandName}>{site.nameCaps}</span>
              <span className={styles.brandTag}>{site.tagline}</span>
            </span>
          </p>
          <address className={styles.address}>
            <p><PinIcon /> <span>{site.address.footerLine}{site.address.sample ? <span className="sample-tag">Sample</span> : null}</span></p>
            <p><PhoneIcon /> <a href={`tel:${site.phone.tel}`}>{site.phone.display}</a> <small>({site.phone.note})</small></p>
            <p><MailIcon /> <a href={`mailto:${site.email.address}`}>{site.email.address}</a></p>
          </address>
        </div>

        <nav aria-label="Quick links">
          <h2 className={styles.h}><T k="Quick Links" /></h2>
          <ul className={styles.links}>
            {footerQuick.map((l) => (<li key={l.label}><a href={l.href} rel="noopener noreferrer">{l.label}</a></li>))}
          </ul>
        </nav>

        <nav aria-label="Useful links">
          <h2 className={styles.h}><T k="Useful Links" /></h2>
          <ul className={styles.links}>
            {footerUseful.map((l) => (<li key={l.label}><a href={l.href} rel="noopener noreferrer">{l.label}</a></li>))}
          </ul>
        </nav>

        <div>
          <h2 className={styles.h}><T k="Stay Connected" /></h2>
          <p className={styles.small}><T k="Subscribe to our newsletter for updates" /></p>
          <NewsletterForm />
          <ul className={styles.social}>
            {site.social.map((s) => {
              const Icon = social[s.id as keyof typeof social]
              return (
                <li key={s.id}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (opens in a new tab)`}><Icon /></a>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h2 className={styles.h}><T k="Find Us on Map" /></h2>
          <a className={styles.map} href={site.mapHref} target="_blank" rel="noopener noreferrer" aria-label="Find University of Swat on the map (opens in a new tab)">
            <svg viewBox="0 0 240 150" aria-hidden="true" focusable="false">
              <rect width="240" height="150" fill="#e6efe0" />
              <path d="M0 110c40-20 70 10 110-6s70-34 130-10v56H0Z" fill="#cfe0c8" />
              <path d="M-10 60 80 40l60 22 110-30" stroke="#fff" strokeWidth="7" fill="none" />
              <path d="M70 -10 96 70l-12 90" stroke="#fff" strokeWidth="5" fill="none" />
              <path d="M120 38c-9 0-15 6-15 15 0 11 15 26 15 26s15-15 15-26c0-9-6-15-15-15Z" fill="#B3261E" />
              <circle cx="120" cy="53" r="5" fill="#fff" />
            </svg>
          </a>
        </div>
      </div>

      <div className={styles.rule} aria-hidden="true" />
      <div className={`container ${styles.bottom}`}>
        <p>© {year} {site.name}. All rights reserved.</p>
        {/* TODO(route): Privacy and Terms pages do not exist yet; they are plain text until they do. */}
        <p className={styles.legal}><span>Privacy</span><span aria-hidden="true">·</span><span>Terms</span></p>
      </div>
    </footer>
  )
}

function Trees({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 200 120" aria-hidden="true" focusable="false">
      <path d="M20 120V80l-14 0 24-40-10 0 24-34 24 34-10 0 24 40-14 0v40Z" fill="currentColor" />
      <path d="M120 120V90l-12 0 20-32-8 0 20-28 20 28-8 0 20 32-12 0v30Z" fill="currentColor" />
    </svg>
  )
}
