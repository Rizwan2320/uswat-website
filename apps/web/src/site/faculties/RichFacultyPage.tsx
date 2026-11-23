import styles from '../academics/Academics.module.css'
import { Band, BannerHeader, Cta, Hero, PictureCard, Prose, SectionNav, SiteLink, Stats } from '../academics/blocks'
import { ContactList, PeopleCards, Sources } from '../offices/blocks'
import { programmeHref } from '../organisation/shape'

import { programmesOfFaculty } from './index'
import type { FacultyProfile } from './types'

/** Four cards sit two by two, not three and one. */
const picMin = (n: number) => (n === 4 ? ({ '--pic-min': '420px' } as React.CSSProperties) : undefined)

/* The faculty landing, in the DCST style: banner, hero, centres, programmes, people, contact, sources. Built from a profile (index.ts);
   a section with no data is not drawn. */
export default function RichFacultyPage({ profile }: { profile: FacultyProfile }) {
  const programmes = programmesOfFaculty(profile.slug)
  const nameOf = (slug: string) => programmes.find((p) => p.slug === slug)?.name ?? slug
  const nav = [
    { id: 'overview', label: 'About' },
    { id: 'centres', label: 'Centres' },
    { id: 'programmes', label: 'Programmes' },
    ...(profile.facilities ? [{ id: 'facilities', label: 'Laboratories' }] : []),
    { id: 'people', label: 'People' },
    { id: 'contact', label: 'Contact' },
    { id: 'sources', label: 'Sources' },
  ]
  return (
    <div className={styles.root}>
      <BannerHeader
        banner={profile.banner}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Academics', href: '/academics' }, { label: profile.shortName }]}
        hideCrumbs
      />
      <Hero
        art={profile.hero}
        badge={profile.shortName}
        lead={profile.lead}
        facts={[
          ['Centres', String(profile.centres.length)],
          ['Programmes', String(programmes.length)],
        ]}
        actions={[
          { label: 'Programmes', href: '#programmes' },
          { label: 'Open the university’s page', href: profile.officialPage, ghost: true },
        ]}
      />
      <Stats items={profile.stats} />
      <SectionNav items={nav} />

      <Band id="overview" kicker="About" title={`About the ${profile.name}`}>
        <Prose paragraphs={profile.about} />
        <div className={styles.vm}>
          <div className={styles.vmCard}>
            <h3>Vision and mission</h3>
            {profile.visionMission.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </Band>

      <Band
        id="centres"
        tint
        kicker="Departments"
        title="Centres"
        lede="The faculty page lists four centres. Where the university’s pages name programmes for a centre, they are listed here."
      >
        <ul className={styles.cards} style={{ '--card-min': '230px' } as React.CSSProperties}>
          {profile.centres.map((c) => (
            <li key={c.name} className={styles.card}>
              {/* The centre's CMS record (c.slug) feeds the programme records; its generic page is not linked until it has a rich page. */}
              <h3 className={styles.cardTitle}>{c.name}</h3>
              <p className={styles.cardText}>
                {c.programmes.length
                  ? `Programmes listed: ${c.programmes.map(nameOf).join('; ')}.`
                  : 'No programme is listed for this centre on the university’s pages yet.'}
              </p>
            </li>
          ))}
        </ul>
      </Band>

      <Band
        id="programmes"
        kicker="Degrees"
        title="Programmes"
        lede="The four programmes the faculty page lists. Curriculum, duration and eligibility are not published yet."
      >
        <ul className={styles.pics} style={picMin(programmes.length)}>
          {programmes.map((p) => (
            <PictureCard
              key={p.slug}
              art={{ ...p.hero, alt: '' }}
              title={p.name}
              href={programmeHref(p.slug)}
              tag={p.shortName}
              meta={p.centre}
              text={p.summary}
              more="Programme page"
            />
          ))}
        </ul>
      </Band>

      {profile.facilities ? (
        <Band id="facilities" tint kicker="Facilities" title="Laboratories">
          <p className={styles.cardText}>{profile.facilities.text}</p>
          <p className={styles.note}>
            <SiteLink href={profile.facilities.link.href}>{profile.facilities.link.label}</SiteLink>
          </p>
        </Band>
      ) : null}

      <Band id="people" kicker="People" title="Who to ask">
        <PeopleCards people={profile.people} />
        {profile.peopleNote ? <p className={styles.note}>{profile.peopleNote}</p> : null}
      </Band>

      <Band id="contact" tint kicker="Contact" title={`Contact the ${profile.shortName} faculty`}>
        <ContactList phones={profile.phones} emails={profile.emails} />
      </Band>

      <Band id="sources" kicker="Where this comes from" title="Sources">
        <Sources sources={profile.sources} verifiedAt={profile.verifiedAt} openPoints={profile.openPoints} />
      </Band>

      <div className="container">
        <Cta
          title={profile.name}
          text="See all programmes of the university, or the departments and centres they belong to."
          actions={[
            { label: 'All programmes', href: '/academics/programmes' },
            { label: 'Departments', href: '/academics/departments', ghost: true },
          ]}
        />
      </div>
    </div>
  )
}
