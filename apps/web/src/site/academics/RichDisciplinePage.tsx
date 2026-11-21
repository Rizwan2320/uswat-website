import PageHeader from '../components/kit/PageHeader'
import { admissions } from '../content/admissions'
import {
  DEPARTMENTS_PATH,
  PROGRAMMES_PATH,
  departmentHref,
  programmeHref,
  rel,
  str,
  paragraphs,
  type Doc,
  type ProgrammeCard,
} from '../organisation/shape'

import styles from './Academics.module.css'
import {
  Band,
  Chips,
  Cta,
  Curriculum,
  DraftNote,
  FaqList,
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
import { disciplinesOf } from './profiles'
import type { DisciplineProfile } from './types'

const STEPS = [
  {
    title: 'Check eligibility',
    text: 'Read the eligibility on this page and keep your documents ready.',
  },
  {
    title: 'Apply online',
    text: 'Apply on the university admissions portal while an intake is open.',
  },
  {
    title: 'Watch the merit list',
    text: 'Merit lists are published on the university notices page.',
  },
  { title: 'Enrol', text: 'Pay the fee and complete enrolment by the date on the notice.' },
]

/* T4, rich layout: used when a profile exists for the programme's slug. `siblings` are the department's published programmes. */
export default function RichDisciplinePage({
  doc,
  profile,
  siblings,
}: {
  doc: Doc
  profile: DisciplineProfile
  siblings: ProgrammeCard[]
}) {
  const name = str(doc.name) ?? profile.shortName
  const dept = rel(doc.department)
  const campus = rel(doc.campus)
  const eligibility = str(doc.eligibility)
  const courseCount = profile.years.reduce(
    (n, y) => n + y.semesters.reduce((m, s) => m + s.courses.length, 0),
    0,
  )
  const others = disciplinesOf(profile.department).filter(
    (d) => d.slug !== profile.slug && siblings.some((s) => s.slug === d.slug),
  )

  const facts: [string, string][] = [
    ['Level', str(doc.level) ?? 'BS'],
    ['Duration', str(doc.duration) ?? '4 years'],
    ...(campus && str(campus.name) ? ([['Campus', str(campus.name)!]] as [string, string][]) : []),
  ]
  const nav = [
    { id: 'overview', label: 'Overview' },
    { id: 'why', label: 'Why study it' },
    { id: 'outcomes', label: 'What you learn' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'careers', label: 'Careers' },
    { id: 'admission', label: 'Admission' },
    { id: 'faq', label: 'Questions' },
    ...(others.length ? [{ id: 'more', label: 'Other programmes' }] : []),
  ]
  return (
    <div className={styles.root}>
      <PageHeader
        title={name}
        lede={profile.tagline}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Academics', href: '/academics' },
          ...(dept && str(dept.slug)
            ? [{ label: str(dept.name) ?? 'Department', href: departmentHref(str(dept.slug)!) }]
            : [{ label: 'Departments', href: DEPARTMENTS_PATH }]),
          { label: profile.shortName },
        ]}
      />
      <Hero
        art={profile.hero}
        badge={`BS ${profile.shortName}`}
        lead={profile.summary}
        facts={facts}
        actions={[
          { label: 'See the curriculum', href: '#curriculum' },
          { label: 'How to apply', href: '#admission', ghost: true },
        ]}
      />
      <Stats
        items={[
          { value: 4, label: 'years' },
          { value: 8, label: 'semesters' },
          { value: courseCount, label: 'courses in the plan' },
          { value: profile.tracks.length, label: 'elective tracks' },
        ]}
      />
      <SectionNav items={nav} />

      <Band id="overview" kicker="About the programme" title={`About ${name}`}>
        <div className={styles.split}>
          <Prose paragraphs={profile.about} />
          <Photo art={profile.figure} />
        </div>
      </Band>

      <Band id="why" tint kicker="Why study it" title={`Why ${name}`}>
        <IconCards items={profile.whyStudy} />
      </Band>

      <Band id="outcomes" kicker="Outcomes" title="What you will learn">
        <div className={styles.split} style={{ alignItems: 'start' }}>
          <ul className={`${styles.list} ${styles.outcomes}`}>
            {profile.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <div className={styles.skills} style={{ gridTemplateColumns: '1fr' }}>
            {profile.skills.map((g) => (
              <div key={g.group} className={styles.skillGroup}>
                <h3>{g.group}</h3>
                <Chips items={g.items} />
              </div>
            ))}
          </div>
        </div>
      </Band>

      <Band
        id="curriculum"
        tint
        kicker="Study plan"
        title="Curriculum by year"
        lede="The first year is shared with the other programmes of the department. Elective courses are chosen from the tracks below."
      >
        <Curriculum years={profile.years} />
        <p className={styles.note}>
          Course lists are a plan, not a timetable. The department publishes the approved scheme of
          studies for each intake.
        </p>
      </Band>

      <Band id="tracks" kicker="Electives" title="Elective tracks">
        <TitledCards items={profile.tracks} />
      </Band>

      <Band id="careers" tint kicker="After graduation" title="Careers and further study">
        <IconRows items={profile.careers} />
      </Band>

      <Band id="admission" kicker="Admission" title="Eligibility and how to apply">
        {eligibility ? <Prose paragraphs={paragraphs(eligibility)} /> : null}
        <ol className={styles.steps} style={{ marginTop: 20 }}>
          {STEPS.map((s) => (
            <li key={s.title} className={styles.step}>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardText}>{s.text}</p>
            </li>
          ))}
        </ol>
      </Band>

      <Band id="faq" tint kicker="Good to know" title="Questions">
        <FaqList items={profile.faq} />
      </Band>

      {others.length ? (
        <Band
          id="more"
          kicker={dept && str(dept.name) ? str(dept.name)! : 'Department'}
          title="Other programmes in the department"
        >
          <ul className={styles.pics}>
            {others.map((d) => {
              const card = siblings.find((s) => s.slug === d.slug)!
              return (
                <PictureCard
                  key={d.slug}
                  art={d.tile}
                  title={card.name}
                  href={programmeHref(d.slug)}
                  tag={d.shortName}
                  meta={[card.level, card.duration].filter(Boolean).join(' · ')}
                  text={d.summary}
                  more="Explore programme"
                />
              )
            })}
          </ul>
          <p style={{ marginTop: 16 }}>
            <a href={PROGRAMMES_PATH}>All programmes of the university</a>
          </p>
        </Band>
      ) : null}

      <div className="container">
        <Cta
          title={`Study ${name}`}
          text="Applications open through the university admissions portal. Merit lists and announcements are posted on the notices page."
          actions={[
            { label: 'Apply online', href: admissions.applyUrl },
            ...(dept && str(dept.slug)
              ? [
                  {
                    label: 'Visit the department',
                    href: departmentHref(str(dept.slug)!),
                    ghost: true,
                  },
                ]
              : []),
          ]}
        />
      </div>
      {profile.status === 'draft' ? <DraftNote /> : null}
    </div>
  )
}
