import styles from '../academics/Academics.module.css'
import { Band, BannerHeader, Cta, DeptFeed, Hero, IconCards, SectionNav, SiteLink, Stats } from '../academics/blocks'
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
  const trail = profile.trail ?? [areaCrumb]
  const hasPeople = profile.people.length > 0
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
    ...(profile.links?.length ? [{ id: 'links', label: 'Where to go' }] : []),
    ...(profile.statements?.length ? [{ id: 'statements', label: profile.statements.map((x) => x.title).join(' and ') }] : []),
    ...(profile.services?.length ? [{ id: 'services', label: profile.servicesTitle ?? 'Services' }] : []),
    ...(profile.itemLists?.length ? [{ id: 'lists', label: profile.itemLists[0].title }] : []),
    ...(hasPeople ? [{ id: 'people', label: 'People' }] : []),
    ...(profile.milestones?.length ? [{ id: 'milestones', label: profile.milestonesTitle ?? 'Dates' }] : []),
    ...(hasContact ? [{ id: 'contact', label: 'Contact' }] : []),
    ...(hasFeed ? [{ id: 'news', label: 'News and notices' }] : []),
    { id: 'sources', label: 'Sources' },
  ]
  return (
    <div className={styles.root}>
      <BannerHeader
        banner={profile.banner}
        crumbs={[{ label: 'Home', href: '/' }, ...trail, { label: profile.shortName }]}
      />
      <Hero
        art={profile.hero}
        badge={profile.shortName}
        lead={profile.lead}
        facts={facts}
        actions={[
          hasContact ? { label: 'Contact details', href: '#contact' } : hasPeople ? { label: 'People', href: '#people' } : { label: 'Sources', href: '#sources' },
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

      {profile.links?.length ? (
        <Band id="links" tint={hasAbout} kicker="Go to" title="Where to go">
          <ul className={styles.plainList}>
            {profile.links.map((l) => (
              <li key={l.href}>
                <SiteLink href={l.href}>{l.label}</SiteLink>
              </li>
            ))}
          </ul>
        </Band>
      ) : null}

      {profile.statements?.length ? (
        <Band id="statements" tint kicker="Direction" title={profile.statements.map((x) => x.title).join(' and ')}>
          <div className={styles.vm}>
            {profile.statements.map((st) => (
              <div key={st.title} className={styles.vmCard}>
                <h3>{st.title}</h3>
                {st.paragraphs.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            ))}
          </div>
        </Band>
      ) : null}

      {profile.services?.length ? (
        <Band id="services" tint kicker={profile.servicesKicker ?? 'What the office does'} title={profile.servicesTitle ?? 'Services'}>
          <IconCards items={profile.services} />
        </Band>
      ) : null}

      {profile.itemLists?.length ? (
        <Band id="lists" kicker="Listed" title={profile.itemLists.length === 1 ? profile.itemLists[0].title : 'What the page lists'}>
          {profile.itemLists.map((l) => (
            <div key={l.title} className={styles.listGroup}>
              {profile.itemLists!.length > 1 ? <h3 className={styles.cardTitle}>{l.title}</h3> : null}
              <ul className={styles.plainList}>
                {l.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              {l.note ? <p className={styles.note}>{l.note}</p> : null}
            </div>
          ))}
        </Band>
      ) : null}

      {hasPeople ? (
        <Band id="people" tint kicker="People" title="Who to ask">
          <PeopleCards people={profile.people} />
          {profile.peopleNote ? <p className={styles.note}>{profile.peopleNote}</p> : null}
        </Band>
      ) : null}

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
          text={
            profile.trail
              ? 'See the departments and programmes of the university, or its offices and boards.'
              : 'See the other directorates, offices and boards of the university, or the research offices, journal and library.'
          }
          actions={
            profile.trail
              ? [
                  { label: 'Departments', href: '/academics/departments' },
                  { label: 'Administration', href: ADMINISTRATION_PATH, ghost: true },
                ]
              : [
                  { label: areaCrumb.label, href: areaCrumb.href },
                  { label: area === 'research' ? 'Administration' : 'Research', href: area === 'research' ? ADMINISTRATION_PATH : RESEARCH_PATH, ghost: true },
                ]
          }
        />
      </div>
    </div>
  )
}
