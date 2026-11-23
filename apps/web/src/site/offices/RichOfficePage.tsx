import styles from '../academics/Academics.module.css'
import { Band, BannerHeader, Cta, DeptFeed, Hero, IconCards, SectionNav, Stats } from '../academics/blocks'
import type { DepartmentFeed } from '../academics/feed'
import { str, type Doc } from '../organisation/shape'

import { ContactList, Milestones, PeopleCards, Sources } from './blocks'
import { ADMINISTRATION_PATH, RESEARCH_PATH } from './landings'
import type { OfficeProfile } from './types'

/* T7, rich layout: an office page built from a profile (profiles/index.ts). Sections with no data are not drawn. */
export default function RichOfficePage({ doc, profile, feed }: { doc: Doc; profile: OfficeProfile; feed: DepartmentFeed }) {
  const name = str(doc.name) ?? profile.name
  const area = profile.lists[0]
  const areaCrumb = area === 'research' ? { label: 'Research', href: RESEARCH_PATH } : { label: 'Administration', href: ADMINISTRATION_PATH }
  const hasContact = Boolean(profile.address || profile.phones?.length || profile.emails?.length || profile.hours)
  const hasFeed = feed.news.length + feed.events.length + feed.notices.length > 0
  const hasAbout = Boolean(profile.about?.length)

  const facts: [string, string][] = [
    ['Group', profile.group],
    ...(profile.hours ? ([['Hours', profile.hours]] as [string, string][]) : []),
    ...(profile.phones?.length === 1 ? ([['Telephone', profile.phones[0].number]] as [string, string][]) : []),
  ]
  const nav = [
    ...(hasAbout ? [{ id: 'overview', label: 'About' }] : []),
    ...(profile.services?.length ? [{ id: 'services', label: profile.servicesTitle ?? 'Services' }] : []),
    { id: 'people', label: 'People' },
    ...(profile.milestones?.length ? [{ id: 'milestones', label: profile.milestonesTitle ?? 'Dates' }] : []),
    ...(hasContact ? [{ id: 'contact', label: 'Contact' }] : []),
    ...(hasFeed ? [{ id: 'news', label: 'News and notices' }] : []),
    { id: 'sources', label: 'Sources' },
  ]
  return (
    <div className={styles.root}>
      <BannerHeader
        banner={profile.banner}
        crumbs={[{ label: 'Home', href: '/' }, areaCrumb, { label: profile.shortName }]}
      />
      <Hero
        art={profile.hero}
        badge={profile.shortName}
        lead={profile.lead}
        facts={facts}
        actions={[
          hasContact ? { label: 'Contact details', href: '#contact' } : { label: 'People', href: '#people' },
          { label: 'Open the university’s page', href: profile.officialPage, ghost: true },
        ]}
      />
      {profile.stats?.length ? <Stats items={profile.stats} /> : null}
      <SectionNav items={nav} />

      {hasAbout ? (
        <Band id="overview" kicker="About" title={`About ${profile.shortName}`}>
          {profile.about!.map((p) => (
            <p key={p} className={styles.cardText}>
              {p}
            </p>
          ))}
        </Band>
      ) : null}

      {profile.services?.length ? (
        <Band id="services" tint kicker="What the office does" title={profile.servicesTitle ?? 'Services'}>
          <IconCards items={profile.services} />
        </Band>
      ) : null}

      <Band id="people" kicker="People" title="Who to ask">
        <PeopleCards people={profile.people} />
        {profile.peopleNote ? <p className={styles.note}>{profile.peopleNote}</p> : null}
      </Band>

      {profile.milestones?.length ? (
        <Band id="milestones" tint kicker="Record" title={profile.milestonesTitle ?? 'Dates'}>
          <Milestones items={profile.milestones} />
        </Band>
      ) : null}

      {hasContact ? (
        <Band id="contact" kicker="Contact" title={`Contact ${profile.shortName}`}>
          <ContactList address={profile.address} phones={profile.phones} emails={profile.emails} hours={profile.hours} />
        </Band>
      ) : null}

      {hasFeed ? (
        <Band id="news" tint kicker="Latest" title="News, events and notices" lede={`Items tagged “${profile.slug}” in the CMS appear here.`}>
          <DeptFeed feed={feed} />
        </Band>
      ) : null}

      <Band id="sources" tint={!hasFeed} kicker="Where this comes from" title="Sources">
        <Sources sources={profile.sources} verifiedAt={profile.verifiedAt} openPoints={profile.openPoints} />
      </Band>

      <div className="container">
        <Cta
          title={name}
          text="See the other directorates, offices and boards of the university, or the research offices, journal and library."
          actions={[
            { label: areaCrumb.label, href: areaCrumb.href },
            { label: area === 'research' ? 'Administration' : 'Research', href: area === 'research' ? ADMINISTRATION_PATH : RESEARCH_PATH, ghost: true },
          ]}
        />
      </div>
    </div>
  )
}
