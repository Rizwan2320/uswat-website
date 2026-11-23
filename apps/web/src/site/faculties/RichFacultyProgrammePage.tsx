import { admissions } from '../content/admissions'
import styles from '../academics/Academics.module.css'
import { Band, BannerHeader, Cta, Hero, PictureCard, Prose, SectionNav, SiteLink } from '../academics/blocks'
import { ContactList, PeopleCards, Sources } from '../offices/blocks'
import officeStyles from '../offices/Offices.module.css'
import { programmeHref, str, type Doc } from '../organisation/shape'

import { profileForFaculty, programmesOfFaculty } from './index'
import type { FacultyProgramme } from './types'

/** Three siblings sit in one row; other counts use the default width. */
const picMin = (n: number) => (n === 4 ? ({ '--pic-min': '420px' } as React.CSSProperties) : undefined)

/* A programme page of a faculty (T4 layout, DCST style) built only from sourced facts: what is not published is said so and not filled in.
   Level, duration, eligibility and links come from the CMS record when an editor has filled them. */
export default function RichFacultyProgrammePage({ doc, profile }: { doc: Doc; profile: FacultyProgramme }) {
  const faculty = profileForFaculty(profile.faculty)
  const name = str(doc.name) ?? profile.name
  const level = str(doc.level)
  const duration = str(doc.duration)
  const eligibility = str(doc.eligibility)
  const curriculum = str(doc.curriculumUrl)
  const fee = str(doc.feeLink)
  const apply = str(doc.applyUrl)
  const siblings = programmesOfFaculty(profile.faculty).filter((p) => p.slug !== profile.slug)

  const facts: [string, string][] = [
    ['Faculty', faculty?.name ?? profile.faculty],
    ...(profile.centre ? ([['Centre', profile.centre]] as [string, string][]) : []),
    ...(level ? ([['Level', level]] as [string, string][]) : []),
    ...(duration ? ([['Duration', duration]] as [string, string][]) : []),
  ]
  const nav = [
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
    { id: 'admission', label: 'Admission' },
    ...(faculty ? [{ id: 'people', label: 'People' }] : []),
    ...(siblings.length ? [{ id: 'more', label: 'Other programmes' }] : []),
    { id: 'sources', label: 'Sources' },
  ]
  return (
    <div className={styles.root}>
      <BannerHeader
        banner={profile.banner}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Academics', href: '/academics' },
          ...(faculty ? [{ label: faculty.shortName, href: faculty.path }] : []),
          { label: profile.shortName },
        ]}
        hideCrumbs
      />
      <Hero
        art={profile.hero}
        badge={profile.shortName}
        lead={profile.summary}
        facts={facts}
        actions={[
          { label: 'Admission', href: '#admission' },
          ...(faculty ? [{ label: 'The faculty', href: faculty.path, ghost: true }] : []),
        ]}
      />
      <SectionNav items={nav} />

      <Band id="overview" kicker="Overview" title={`About ${name}`}>
        <Prose paragraphs={[...profile.about, ...(faculty ? [faculty.about[1]] : [])]} />
      </Band>

      <Band id="details" tint kicker="Details" title="Duration, eligibility and curriculum">
        {duration || eligibility || curriculum || fee ? (
          <dl className={officeStyles.contact}>
            {duration ? (
              <div className={officeStyles.contactItem}>
                <dt>Duration</dt>
                <dd>{duration}</dd>
              </div>
            ) : null}
            {eligibility ? (
              <div className={officeStyles.contactItem}>
                <dt>Eligibility</dt>
                <dd>{eligibility}</dd>
              </div>
            ) : null}
            {curriculum ? (
              <div className={officeStyles.contactItem}>
                <dt>Curriculum</dt>
                <dd>
                  <SiteLink href={curriculum}>Curriculum (PDF)</SiteLink>
                </dd>
              </div>
            ) : null}
            {fee ? (
              <div className={officeStyles.contactItem}>
                <dt>Fee</dt>
                <dd>
                  <SiteLink href={fee}>Fee information</SiteLink>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className={styles.cardText}>
            The faculty has not published the duration, eligibility, fee or curriculum of this programme yet. They will appear here when it does.
          </p>
        )}
      </Band>

      <Band id="admission" kicker="Admission" title="How to apply">
        <p className={styles.cardText}>
          {profile.listedOn.includes('qec-list')
            ? 'The university’s Quality Enhancement Cell says the Faculty of Allied Health Sciences launched admission with Fall 2025. Intakes are announced on the notices page.'
            : 'This programme is listed on the faculty page. Check the notices page for an admission announcement.'}
        </p>
        {apply ? (
          <p className={styles.note}>
            <SiteLink href={apply}>Apply for this programme</SiteLink>
          </p>
        ) : null}
      </Band>

      {faculty ? (
        <Band id="people" tint kicker="People" title="Who to ask">
          <PeopleCards people={faculty.people} />
          <div style={{ marginTop: 20 }}>
            <ContactList phones={faculty.phones} emails={faculty.emails} />
          </div>
        </Band>
      ) : null}

      {siblings.length ? (
        <Band id="more" kicker="The faculty" title="Other programmes of the faculty" lede="The other degree programmes the faculty page lists.">
          <ul className={styles.pics} style={picMin(siblings.length)}>
            {siblings.map((p) => (
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
      ) : null}

      <Band id="sources" tint={!siblings.length} kicker="Where this comes from" title="Sources">
        <Sources sources={profile.sources} verifiedAt={profile.verifiedAt} openPoints={profile.openPoints} />
      </Band>

      <div className="container">
        <Cta
          title={name}
          text="See the faculty page for its centres, people and contact details, or watch the notices for admission announcements."
          actions={[
            ...(faculty ? [{ label: faculty.name, href: faculty.path }] : []),
            { label: 'Admissions', href: admissions.applyUrl, ghost: true },
          ]}
        />
      </div>
    </div>
  )
}
