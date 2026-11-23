import styles from '../academics/Academics.module.css'
import { Band, BannerHeader, Cta, Hero, PictureCard, SectionNav, SiteLink, Stats } from '../academics/blocks'
import AcademicIcon from '../academics/AcademicIcon'
import { officeHref } from '../organisation/shape'

import { Milestones, Sources } from './blocks'
import { ADMINISTRATION_PATH, RESEARCH } from './landings'
import { officesListedOn, profileForOffice } from './profiles'

/* T2 section landing for /research. */
export default function RichResearchPage() {
  const offices = officesListedOn('research')
  const oric = profileForOffice('oric-2')
  const nav = [
    { id: 'offices', label: 'Research offices' },
    { id: 'resources', label: 'Journal and library' },
    ...(oric?.milestones?.length ? [{ id: 'conferences', label: 'Conferences' }] : []),
    { id: 'sources', label: 'Sources' },
  ]
  return (
    <div className={styles.root}>
      <BannerHeader banner={RESEARCH.banner} crumbs={[{ label: 'Home', href: '/' }, { label: 'Research' }]} />
      <Hero
        art={RESEARCH.hero}
        badge="Research"
        lead={RESEARCH.lead}
        facts={[
          ['Research offices', String(offices.length)],
          ['Journal', 'SUJRIS'],
        ]}
        actions={[
          { label: 'Research offices', href: '#offices' },
          { label: 'Administration', href: ADMINISTRATION_PATH, ghost: true },
        ]}
      />
      <Stats items={RESEARCH.stats} />
      <SectionNav items={nav} />

      <Band id="offices" kicker="Offices" title="Research offices" lede="The two offices that look after research at the university.">
        <ul className={styles.pics}>
          {offices.map((o) => (
            <PictureCard
              key={o.slug}
              art={o.hero}
              title={o.name}
              href={officeHref(o.slug)}
              tag={o.shortName}
              meta={`${o.people.length} people listed`}
              text={o.lead}
              more="Open the office"
            />
          ))}
        </ul>
      </Band>

      <Band id="resources" tint kicker="Publishing and reading" title="Journal and library">
        <ul className={styles.cards} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {RESEARCH.resources.map((r) => (
            <li key={r.title} className={styles.card}>
              <span className={styles.icon}>
                <AcademicIcon name={r.icon} />
              </span>
              <h3 className={styles.cardTitle}>{r.title}</h3>
              <p className={styles.cardText}>{r.text}</p>
              <SiteLink href={r.href} className={styles.more}>
                {r.linkLabel} →
              </SiteLink>
            </li>
          ))}
        </ul>
      </Band>

      {oric?.milestones?.length ? (
        <Band id="conferences" kicker="Events" title={oric.milestonesTitle ?? 'Conferences'}>
          <Milestones items={oric.milestones} />
        </Band>
      ) : null}

      <Band id="sources" tint kicker="Where this comes from" title="Sources">
        <Sources sources={RESEARCH.sources} verifiedAt={RESEARCH.verifiedAt} />
      </Band>

      <div className="container">
        <Cta
          title="Contact the research office"
          text="ORIC and DASR have their own pages with the people who run them."
          actions={[
            { label: 'ORIC', href: officeHref('oric-2') },
            { label: 'DASR', href: officeHref('advanced-studies-and-research-board'), ghost: true },
          ]}
        />
      </div>
    </div>
  )
}

