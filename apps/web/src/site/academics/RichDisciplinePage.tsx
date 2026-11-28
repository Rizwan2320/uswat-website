import { admissions } from '../content/admissions'
import {
  DEPARTMENTS_PATH,
  departmentHref,
  rel,
  str,
  paragraphs,
  type Doc,
} from '../organisation/shape'

import styles from './Academics.module.css'
import AlumniShowcase from './Alumni'
import { alumniForProgramme, cardOfWork } from './alumni'
import {
  BannerHeader,
  Band,
  Chips,
  CoordinatorNote,
  Cta,
  Curriculum,
  DeptFeed,
  DraftNote,
  FaqList,
  Hero,
  IconCards,
  IconRows,
  Photo,
  Prose,
  SectionNav,
  Stats,
  TitledCards,
} from './blocks'
import { coordinatorOf, departmentPath, profileForDepartment } from './profiles'
import type { DepartmentFeed } from './feed'
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
  feed,
}: {
  doc: Doc
  profile: DisciplineProfile
  feed: DepartmentFeed
}) {
  const name = str(doc.name) ?? profile.shortName
  const dept = rel(doc.department)
  const campus = rel(doc.campus)
  const eligibility = str(doc.eligibility) ?? profile.eligibility ?? null
  const courseCount = profile.years.reduce(
    (n, y) => n + y.semesters.reduce((m, s) => m + s.courses.length, 0),
    0,
  )
  const coordinator = coordinatorOf(profile.department, profile.slug)
  const department = profileForDepartment(profile.department)
  const deptHref = department ? departmentPath(department) : null

  const alumni = profile.alumniCards?.length
    ? profile.alumniCards
    : alumniForProgramme(profile.slug).slice(0, 3).map(cardOfWork)

  const facts: [string, string][] = [
    ['Level', str(doc.level) ?? profile.level ?? 'BS'],
    ['Duration', str(doc.duration) ?? profile.duration ?? '4 years'],
    ...(profile.centre ? ([['Centre', profile.centre]] as [string, string][]) : []),
    ...(campus && str(campus.name) ? ([['Campus', str(campus.name)!]] as [string, string][]) : []),
  ]
  const nav = [
    { id: 'overview', label: 'Overview' },
    { id: 'why', label: 'Why study it' },
    { id: 'outcomes', label: 'What you learn' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'careers', label: 'Careers' },
    ...(alumni.length ? [{ id: 'alumni', label: 'Alumni' }] : []),
    { id: 'admission', label: 'Admission' },
    { id: 'faq', label: 'Questions' },
    { id: 'news', label: 'News and notices' },
  ]
  return (
    <div className={styles.root}>
      <BannerHeader
        banner={profile.banner}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Academics', href: '/academics' },
          ...(deptHref
            ? [{ label: (dept && str(dept.name)) || department?.shortName || 'Department', href: deptHref }]
            : dept && str(dept.slug)
              ? [{ label: str(dept.name) ?? 'Department', href: departmentHref(str(dept.slug)!) }]
              : [{ label: 'Departments', href: DEPARTMENTS_PATH }]),
          { label: profile.shortName },
        ]}
        hideCrumbs
        photos={department?.heroPhotos}
      />
      <Hero
        art={profile.hero}
        badge={profile.badge ?? `BS ${profile.shortName}`}
        lead={profile.summary}
        facts={facts}
        actions={[
          { label: 'See the curriculum', href: '#curriculum' },
          { label: 'How to apply', href: '#admission', ghost: true },
        ]}
      />
      <Stats
        items={[
          { value: profile.years.length, label: 'years' },
          { value: profile.years.length * 2, label: 'semesters' },
          { value: courseCount, label: 'courses in the plan' },
          { value: profile.tracks.length, label: 'elective tracks' },
        ]}
      />
      <SectionNav items={nav} />

      <Band id="overview" kicker="About the programme" title={`About ${name}`}>
        <div className={styles.split}>
          <div>
            <Prose paragraphs={profile.about} />
            {coordinator ? <CoordinatorNote member={coordinator} /> : null}
          </div>
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
        lede={
          profile.curriculumLede ??
          'The first year is shared with the other programmes of the department. Elective courses are chosen from the tracks below.'
        }
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

      <AlumniShowcase
        items={alumni}
        lede={`Theses, projects and papers by graduates of ${profile.badge ?? `BS ${profile.shortName}`}.${alumni.some((a) => a.href) ? ' Select a card to read about the work.' : ''}`}
      />

      <Band id="admission" tint kicker="Admission" title="Eligibility and how to apply">
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

      <Band id="faq" kicker="Good to know" title="Questions">
        <FaqList items={profile.faq} />
      </Band>

      <Band
        id="news"
        tint
        kicker="From the department"
        title="News, events and notices"
        lede="Announcements from the department that runs this programme."
      >
        <DeptFeed feed={feed} />
      </Band>

      <div className="container">
        <Cta
          title={`Study ${name}`}
          text="Applications open through the university admissions portal. Merit lists and announcements are posted on the notices page."
          actions={[
            { label: 'Apply online', href: admissions.applyUrl },
            ...(deptHref || (dept && str(dept.slug))
              ? [
                  {
                    label: 'Visit the department',
                    href: deptHref ?? departmentHref(str(dept!.slug)!),
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
