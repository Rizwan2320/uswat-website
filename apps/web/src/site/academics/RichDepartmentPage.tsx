import { admissions } from '../content/admissions'
import {
  DEPARTMENTS_PATH,
  programmeHref,
  str,
  paragraphs,
  type Doc,
  type ProgrammeCard,
} from '../organisation/shape'

import styles from './Academics.module.css'
import {
  BannerHeader,
  Band,
  CoordinatorCards,
  Cta,
  DeptFeed,
  DraftNote,
  FaqList,
  HeadCard,
  HeadIntroCard,
  Hero,
  IconCards,
  IconRows,
  Photo,
  PictureCard,
  Prose,
  SectionNav,
  Stats,
  TitledCards,
} from './blocks'
import { ContactList, Sources } from '../offices/blocks'

import AlumniShowcase from './Alumni'
import { alumniBySlugs, cardOfWork } from './alumni'
import { art } from './profiles/art'
import { disciplinesOf } from './profiles'
import type { DepartmentFeed } from './feed'
import type { DepartmentProfile } from './types'

/* T3, rich layout: used when a profile exists for the department's slug (see profiles/index.ts). */
export default function RichDepartmentPage({
  doc,
  profile,
  programmes,
  feed,
}: {
  doc: Doc
  profile: DepartmentProfile
  programmes: ProgrammeCard[]
  feed: DepartmentFeed
}) {
  const head = profile.team.find((m) => m.role === 'head')
  const coordinators = profile.team.filter((m) => m.role === 'coordinator')
  const members = profile.team.filter((m) => m.role === 'member')
  const programmeNames = new Map(programmes.map((p) => [p.slug, p.name]))
  const vision = str(doc.vision) ?? profile.vision
  const mission = str(doc.mission) ?? profile.mission

  // Disciplines: the profile's order first, then any other programme of the department.
  const order = profile.disciplines
  const sorted = [...programmes].sort((a, b) => {
    const ia = order.indexOf(a.slug)
    const ib = order.indexOf(b.slug)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })
  const known = disciplinesOf(profile.slug)
  const programmeCards = sorted.map((p) => {
    const d = known.find((k) => k.slug === p.slug)
    return { p, d }
  })

  const alumni = profile.alumniCards?.length
    ? profile.alumniCards
    : alumniBySlugs(profile.alumni ?? []).map(cardOfWork)
  const ref = profile.reference

  const stats = [
    { value: programmes.length, label: 'degree programmes' },
    { value: profile.durationText ?? '4 years', label: profile.durationNote ?? 'eight semesters each' },
    { value: profile.labs.length, label: 'laboratories' },
    { value: profile.research.length, label: 'research areas' },
  ]
  const nav = [
    { id: 'overview', label: 'Overview' },
    { id: 'programmes', label: 'Programmes' },
    { id: 'labs', label: 'Laboratories' },
    { id: 'research', label: 'Research' },
    { id: 'careers', label: 'Careers' },
    { id: 'student-life', label: 'Student life' },
    { id: 'people', label: 'Faculty' },
    ...(alumni.length ? [{ id: 'alumni', label: 'Alumni' }] : []),
    { id: 'news', label: 'News and notices' },
    { id: 'faq', label: 'Questions' },
    ...(ref ? [{ id: 'contact', label: 'Contact' }, { id: 'sources', label: 'Sources' }] : []),
  ]
  return (
    <div className={styles.root}>
      <BannerHeader
        banner={profile.banner}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Academics', href: '/academics' },
          { label: 'Departments', href: DEPARTMENTS_PATH },
          { label: profile.shortName },
        ]}
        hideCrumbs
        photos={profile.heroPhotos}
      />
      <Hero
        art={profile.hero}
        photo={profile.campusPhoto}
        badge={profile.shortName}
        lead={profile.intro}
        facts={[
          ['Programmes', String(programmes.length)],
          ['Level', profile.levelText ?? 'BS'],
          ['Duration', profile.durationText ?? '4 years'],
        ]}
        actions={[
          { label: 'Explore programmes', href: '#programmes' },
          { label: 'News and notices', href: '#news', ghost: true },
        ]}
      />
      <Stats items={stats} />
      <SectionNav items={nav} />

      <Band id="overview" kicker="About" title={`About ${profile.shortName}`}>
        <div className={styles.split}>
          <Prose paragraphs={profile.about} />
          {head?.photo ? (
            <HeadIntroCard
              name={head.name}
              title={head.title}
              photo={head.photo}
              label={head.roleLabel}
            />
          ) : (
            <Photo art={profile.tile ?? art('dcst', 'tile', 'Illustration of a computer chip with the letters DCST')} />
          )}
        </div>
        <div className={styles.vm}>
          <div className={styles.vmCard}>
            <h3>Vision</h3>
            {paragraphs(vision).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className={styles.vmCard}>
            <h3>Mission</h3>
            {paragraphs(mission).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </Band>

      <Band id="why" tint kicker="Why study here" title={`Why ${profile.shortName}`}>
        <IconCards items={profile.highlights} />
      </Band>

      <Band
        id="programmes"
        kicker="Degrees"
        title="Programmes"
        lede={
          profile.programmesLede ??
          'Five four-year BS programmes share one first year. Choose the one that matches how you like to work.'
        }
      >
        {programmeCards.length ? (
          <ul
            className={styles.pics}
            style={programmeCards.length === 4 ? ({ '--pic-min': '420px' } as React.CSSProperties) : undefined}
          >
            {programmeCards.map(({ p, d }) => (
              <PictureCard
                key={p.id}
                art={d?.tile ?? profile.tile ?? art('dcst', 'tile')}
                title={p.name}
                href={programmeHref(p.slug)}
                tag={d?.shortName}
                meta={[p.level, p.duration, d?.centre].filter(Boolean).join(' · ')}
                text={d?.summary ?? ''}
                more="Explore programme"
              />
            ))}
          </ul>
        ) : (
          <p>No programmes are listed for this department yet.</p>
        )}
      </Band>

      <Band
        id="labs"
        tint
        kicker="Facilities"
        title="Laboratories and studios"
        lede="Every programme includes regular laboratory work."
      >
        <ul className={styles.pics}>
          {profile.labs.map((l) => (
            <PictureCard
              key={l.title}
              art={{ ...l.art, alt: '' }}
              title={l.title}
              text={l.text}
              tools={l.tools}
            />
          ))}
        </ul>
      </Band>

      <Band id="research" kicker="Research" title="Research areas">
        <TitledCards items={profile.research} />
      </Band>

      <Band
        id="careers"
        tint
        kicker="After graduation"
        title="Careers"
        lede="Where graduates of the department go to work."
      >
        <IconRows items={profile.careers} />
      </Band>

      <Band id="student-life" kicker="Beyond the classroom" title="Student life">
        <IconCards items={profile.studentLife} />
      </Band>

      <Band
        id="people"
        tint
        kicker="Faculty"
        title={profile.peopleTitle ?? 'Leadership and coordinators'}
        lede={profile.peopleLede ?? 'Each programme has a coordinator who guides students through the study plan.'}
      >
        {head ? <HeadCard member={head} /> : null}
        {coordinators.length ? (
          <>
            <h3 className={styles.subhead}>Programme coordinators</h3>
            <CoordinatorCards
              members={coordinators}
              programmeNames={programmeNames}
              programmeHref={programmeHref}
            />
          </>
        ) : null}
        {members.length ? (
          <>
            <h3 className={styles.subhead}>Faculty members</h3>
            <CoordinatorCards
              compact
              members={members}
              programmeNames={programmeNames}
              programmeHref={programmeHref}
            />
          </>
        ) : null}
      </Band>

      <AlumniShowcase
        items={alumni}
        lede={`Theses, projects and papers by graduates of the department's programmes.${alumni.some((a) => a.href) ? ' Select a card to read about the work.' : ''}`}
      />

      <Band
        id="news"
        tint
        kicker="Latest"
        title="News, events and notices"
        lede={`Announcements from ${profile.shortName}. Items tagged "${profile.shortName}" in the CMS appear here.`}
      >
        <DeptFeed feed={feed} />
      </Band>

      <Band id="faq" kicker="Good to know" title="Questions">
        <FaqList items={profile.faq} />
      </Band>

      {ref ? (
        <>
          <Band id="contact" tint kicker="Contact" title={`Contact ${profile.shortName}`}>
            <ContactList phones={ref.phones} emails={ref.emails} />
          </Band>
          <Band id="sources" kicker="Where this comes from" title="Sources">
            {profile.status === 'draft' ? (
              <p className={styles.note}>
                Only the facts listed below come from the university’s own pages. The rest of this page, including the laboratories,
                research areas, careers and study plans, is illustrative text that the faculty has not yet reviewed.
              </p>
            ) : null}
            <Sources sources={ref.sources} verifiedAt={ref.verifiedAt} openPoints={ref.openPoints} />
          </Band>
        </>
      ) : null}

      <div className="container">
        <Cta
          title="Ready to apply?"
          text="Applications open through the university admissions portal. Merit lists and announcements are posted on the notices page."
          actions={[
            { label: 'Apply online', href: admissions.applyUrl },
            { label: 'Explore programmes', href: '#programmes', ghost: true },
          ]}
        />
      </div>
      {profile.status === 'draft' ? <DraftNote /> : null}
    </div>
  )
}
