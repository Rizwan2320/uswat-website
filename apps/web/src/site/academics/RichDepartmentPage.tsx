import { safeHref } from '@/utilities/safeHref'

import PageHeader from '../components/kit/PageHeader'
import { admissions } from '../content/admissions'
import {
  DEPARTMENTS_PATH,
  programmeHref,
  rel,
  str,
  paragraphs,
  type Doc,
  type ProgrammeCard,
} from '../organisation/shape'
import type { PersonCard } from '../organisation/queries'

import styles from './Academics.module.css'
import {
  Band,
  Cta,
  DraftNote,
  FaqList,
  Hero,
  IconCards,
  IconRows,
  Photo,
  PictureCard,
  Prose,
  SectionNav,
  SiteLink,
  Stats,
  TitledCards,
  initials,
} from './blocks'
import { art } from './profiles/art'
import { disciplinesOf } from './profiles'
import type { DepartmentProfile } from './types'

/* T3, rich layout: used when a profile exists for the department's slug (see profiles/index.ts). */
export default function RichDepartmentPage({
  doc,
  profile,
  programmes,
  people,
}: {
  doc: Doc
  profile: DepartmentProfile
  programmes: ProgrammeCard[]
  people: PersonCard[]
}) {
  const name = str(doc.name) ?? profile.shortName
  const head = rel(doc.head)
  const emails = (Array.isArray(doc.emails) ? doc.emails : []).flatMap((e) =>
    str((e as Doc).email) ? [str((e as Doc).email)!] : [],
  )
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
  const staff = people.filter((p) => !head || p.name !== str(head.name))

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
    { id: 'people', label: 'People' },
    { id: 'faq', label: 'Questions' },
    { id: 'contact', label: 'Contact' },
  ]
  return (
    <div className={styles.root}>
      <PageHeader
        title={name}
        lede={profile.tagline}
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
          { label: 'Contact the department', href: '#contact', ghost: true },
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

      <Band id="people" tint kicker="Faculty" title="People">
        {head && str(head.name) ? (
          <div className={styles.head}>
            <span className={styles.avatar} aria-hidden="true">
              {initials(str(head.name)!)}
            </span>
            <div>
              <p className={styles.personName}>{str(head.name)}</p>
              <p className={styles.personRole}>
                {[str(head.designation), 'Head of department'].filter(Boolean).join(', ')}
              </p>
              {str(head.email) && safeHref(`mailto:${str(head.email)}`) ? (
                <a className={styles.personMail} href={`mailto:${str(head.email)}`}>
                  {str(head.email)}
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
        {staff.length ? (
          <ul className={styles.people}>
            {staff.map((p) => (
              <li key={p.id} className={styles.person}>
                <span className={styles.avatar} aria-hidden="true">
                  {initials(p.name)}
                </span>
                <div>
                  <p className={styles.personName}>{p.name}</p>
                  {p.designation ? <p className={styles.personRole}>{p.designation}</p> : null}
                  {p.email && safeHref(`mailto:${p.email}`) ? (
                    <a className={styles.personMail} href={`mailto:${p.email}`}>
                      {p.email}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {!head && !staff.length ? <p>No people are listed for this department yet.</p> : null}
      </Band>

      <Band id="faq" kicker="Good to know" title="Questions">
        <FaqList items={profile.faq} />
      </Band>

      <Band id="contact" tint kicker="Get in touch" title="Contact">
        <div className={styles.split}>
          <div className={styles.contact}>
            <dl>
              <div>
                <dt>Department</dt>
                <dd>{name}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{profile.location}</dd>
              </div>
              <div>
                <dt>Office hours</dt>
                <dd>{profile.hours}</dd>
              </div>
              {emails.length ? (
                <div>
                  <dt>E-mail</dt>
                  <dd>
                    {emails.map((e) => (
                      <div key={e}>
                        <a href={`mailto:${e}`}>{e}</a>
                      </div>
                    ))}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Directory</dt>
                <dd>
                  <SiteLink href="/contact/directory">University contact directory</SiteLink>
                </dd>
              </div>
            </dl>
          </div>
          <Photo art={profile.campusPhoto} />
        </div>
        <Cta
          title="Ready to apply?"
          text="Applications open through the university admissions portal. Merit lists and announcements are posted on the notices page."
          actions={[
            { label: 'Apply online', href: admissions.applyUrl },
            { label: 'Read the notices', href: '/notices', ghost: true },
          ]}
        />
      </Band>
      {profile.status === 'draft' ? <DraftNote /> : null}
    </div>
  )
}
