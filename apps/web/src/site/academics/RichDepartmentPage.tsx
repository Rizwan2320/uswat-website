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

  const stats = [
    { value: programmes.length, label: 'degree programmes' },
    { value: '4 years', label: 'eight semesters each' },
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
    { id: 'news', label: 'News and notices' },
    { id: 'faq', label: 'Questions' },
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
      />
      <Hero
        art={profile.hero}
        badge={profile.shortName}
        lead={profile.intro}
        facts={[
          ['Programmes', String(programmes.length)],
          ['Level', 'BS'],
          ['Duration', '4 years'],
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
          <Photo
            art={art('dcst', 'tile', 'Illustration of a computer chip with the letters DCST')}
          />
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
        lede="Five four-year BS programmes share one first year. Choose the one that matches how you like to work."
      >
        {programmeCards.length ? (
          <ul className={styles.pics}>
            {programmeCards.map(({ p, d }) => (
              <PictureCard
                key={p.id}
                art={d?.tile ?? art('dcst', 'tile')}
                title={p.name}
                href={programmeHref(p.slug)}
                tag={d?.shortName}
                meta={[p.level, p.duration].filter(Boolean).join(' · ')}
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
        title="Leadership and coordinators"
        lede="Each programme has a coordinator who guides students through the study plan."
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
      </Band>

      <Band
        id="news"
        kicker="Latest"
        title="News, events and notices"
        lede={`Announcements from ${profile.shortName}. Items tagged "${profile.shortName}" in the CMS appear here.`}
      >
        <DeptFeed feed={feed} />
      </Band>

      <Band id="faq" kicker="Good to know" title="Questions">
        <FaqList items={profile.faq} />
      </Band>

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
