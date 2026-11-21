import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { T } from '../components/I18n'
import SafeImage from '../components/SafeImage'
import Accordion from '../components/kit/Accordion'
import Tabs from '../components/kit/Tabs'

import { formatDate, formatDateTime } from '../articles/format'
import type { ListItem } from '../articles/where'

import AcademicIcon from './AcademicIcon'
import styles from './Academics.module.css'
import type { DepartmentFeed } from './feed'
import type { Art, Faq, IconTitled, TeamMember, Titled, Year } from './types'

/* Next Link for pages of this site, a plain link for in-page anchors and other sites. */
export function SiteLink({
  href,
  children,
  ...rest
}: { href: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  if (href.startsWith('/'))
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  if (href.startsWith('#'))
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  return (
    <a href={href} rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}

/* Building blocks shared by the department (T3) and discipline (T4) pages. Each takes plain data, so a new department
   needs a profile, not new components. */

export function Band({
  id,
  title,
  kicker,
  lede,
  tint,
  children,
}: {
  id: string
  title: string
  kicker?: string
  lede?: string
  tint?: boolean
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={`${styles.band} ${tint ? styles.tint : ''}`}
    >
      <div className="container">
        {kicker ? (
          <p className={styles.kicker}>
            <T k={kicker} />
          </p>
        ) : null}
        <h2 id={`${id}-h`} className={styles.h2}>
          <T k={title} />
        </h2>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
        {children}
      </div>
    </section>
  )
}

export function Hero({
  art,
  badge,
  lead,
  facts,
  actions,
}: {
  art: Art
  badge: string
  lead: string
  facts?: [string, string][]
  actions: { label: string; href: string; ghost?: boolean }[]
}) {
  return (
    <div className="container">
      <div className={styles.heroWrap}>
        <div className={styles.hero}>
          <div className={styles.heroArt}>
            <SafeImage
              src={art.src}
              alt={art.alt}
              fill
              sizes="(max-width: 860px) 100vw, 1200px"
              priority
            />
          </div>
          <div className={styles.heroText}>
            <span className={styles.badge}>{badge}</span>
            <p className={styles.heroLead}>{lead}</p>
            {facts?.length ? (
              <ul className={styles.heroFacts}>
                {facts.map(([label, value]) => (
                  <li key={label}>
                    <span>
                      <T k={label} />
                    </span>
                    {value}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className={styles.actions}>
              {actions.map((a) => (
                <SiteLink
                  key={a.label}
                  href={a.href}
                  className={a.ghost ? styles.btnGhost : styles.btn}
                >
                  <T k={a.label} />
                </SiteLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Stats({ items }: { items: { value: string | number; label: string }[] }) {
  return (
    <div className="container">
      <ul className={styles.stats}>
        {items.map((s) => (
          <li key={s.label} className={styles.stat}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>
              <T k={s.label} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  return (
    <div className="container">
      <nav className={styles.toc} aria-label="On this page">
        <ul className={styles.tocList}>
          {items.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`}>
                <T k={i.label} />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className={styles.prose}>
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  )
}

export function Photo({
  art,
  sizes = '(max-width: 860px) 100vw, 520px',
}: {
  art: Art
  sizes?: string
}) {
  return (
    <div className={styles.photo}>
      <SafeImage src={art.src} alt={art.alt} fill sizes={sizes} />
    </div>
  )
}

/** Four cards sit in one row where there is room; other counts fill rows of three. */
const cardMin = (n: number) =>
  ({ '--card-min': n === 4 ? '230px' : '300px' }) as React.CSSProperties

export function IconCards({ items }: { items: IconTitled[] }) {
  return (
    <ul className={styles.cards} style={cardMin(items.length)}>
      {items.map((i) => (
        <li key={i.title} className={styles.card}>
          <span className={styles.icon}>
            <AcademicIcon name={i.icon} />
          </span>
          <h3 className={styles.cardTitle}>{i.title}</h3>
          <p className={styles.cardText}>{i.text}</p>
        </li>
      ))}
    </ul>
  )
}

/** Two columns of icon and text rows: careers, student life. */
export function IconRows({ items }: { items: IconTitled[] }) {
  return (
    <ul className={styles.rows}>
      {items.map((i) => (
        <li key={i.title} className={styles.row}>
          <span className={styles.icon}>
            <AcademicIcon name={i.icon} />
          </span>
          <div>
            <h3 className={styles.cardTitle}>{i.title}</h3>
            <p className={styles.cardText}>{i.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Chips({ items }: { items: string[] }) {
  return (
    <ul className={styles.chips}>
      {items.map((c) => (
        <li key={c} className={styles.chip}>
          {c}
        </li>
      ))}
    </ul>
  )
}

/** A card with a picture on top. With `href` the whole card is the link. */
export function PictureCard({
  art,
  title,
  href,
  tag,
  meta,
  text,
  tools,
  more,
}: {
  art: Art
  title: string
  href?: string
  tag?: string
  meta?: string
  text: string
  tools?: string[]
  more?: string
}) {
  return (
    <li className={styles.pic}>
      <div className={styles.picImg}>
        <SafeImage src={art.src} alt={art.alt} fill sizes="(max-width: 600px) 100vw, 340px" />
        {tag ? <span className={styles.chipTag}>{tag}</span> : null}
      </div>
      <div className={styles.picBody}>
        <h3 className={styles.picTitle}>
          {href ? (
            <SiteLink href={href} className={styles.picLink}>
              {title}
            </SiteLink>
          ) : (
            title
          )}
        </h3>
        {meta ? <p className={styles.meta}>{meta}</p> : null}
        <p className={styles.cardText}>{text}</p>
        {tools?.length ? <Chips items={tools} /> : null}
        {href && more ? (
          <span className={styles.more} aria-hidden="true">
            {more} →
          </span>
        ) : null}
      </div>
    </li>
  )
}

export function TitledCards({
  items,
}: {
  items: (Titled & { icon: IconTitled['icon']; tags?: string[] })[]
}) {
  return (
    <ul className={styles.cards}>
      {items.map((i) => (
        <li key={i.title} className={styles.card}>
          <span className={styles.icon}>
            <AcademicIcon name={i.icon} />
          </span>
          <h3 className={styles.cardTitle}>{i.title}</h3>
          <p className={styles.cardText}>{i.text}</p>
          {i.tags?.length ? <Chips items={i.tags} /> : null}
        </li>
      ))}
    </ul>
  )
}

export function Curriculum({ years }: { years: Year[] }) {
  return (
    <Tabs
      label="Curriculum by year"
      items={years.map((y) => ({
        id: `y${y.year}`,
        label: `Year ${y.year}`,
        content: (
          <div className={styles.sems}>
            {y.semesters.map((s) => (
              <div key={s.name} className={styles.sem}>
                <h3>{s.name}</h3>
                <ol className={styles.courses}>
                  {s.courses.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ),
      }))}
    />
  )
}

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div style={{ maxWidth: 860 }}>
      <Accordion
        items={items.map((f, i) => ({
          id: `q${i}`,
          title: f.q,
          content: <p className={styles.cardText}>{f.a}</p>,
        }))}
        defaultOpen={['q0']}
      />
    </div>
  )
}

export function Cta({
  title,
  text,
  actions,
}: {
  title: string
  text: string
  actions: { label: string; href: string; ghost?: boolean }[]
}) {
  return (
    <div className={styles.cta}>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className={styles.actions}>
        {actions.map((a) => (
          <SiteLink key={a.label} href={a.href} className={a.ghost ? styles.btnGhost : styles.btn}>
            <T k={a.label} />
          </SiteLink>
        ))}
      </div>
    </div>
  )
}

export function DraftNote() {
  return (
    <p className={styles.draft} role="note">
      Draft page: the text and course lists are being reviewed by the department.
    </p>
  )
}

export const initials = (name: string) =>
  name
    .replace(/\b(dr|prof|professor|mr|ms|mrs)\.?\s/gi, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

/** A portrait in a 4:5 frame. With no photo yet it shows the person's initials, so the slot is never empty. */
export function Portrait({
  member,
  className,
  sizes = '(max-width: 600px) 60vw, 280px',
}: {
  member: TeamMember
  className?: string
  sizes?: string
}) {
  return (
    <div className={`${styles.portrait} ${className ?? ''}`}>
      {member.photo ? (
        <SafeImage src={member.photo} alt={member.name} fill sizes={sizes} />
      ) : (
        <span className={styles.portraitInitials} aria-hidden="true">
          {initials(member.name)}
        </span>
      )}
    </div>
  )
}

const coordinatesLabel = (m: TeamMember, names: Map<string, string>) =>
  (m.coordinates ?? []).map((slug) => ({ slug, name: names.get(slug) ?? slug }))

/** The head of department: a wide card with a large portrait and the qualifications. */
export function HeadCard({ member }: { member: TeamMember }) {
  return (
    <article className={styles.headCard}>
      <Portrait member={member} className={styles.headPortrait} sizes="(max-width: 700px) 60vw, 260px" />
      <div className={styles.headBody}>
        <span className={styles.roleTag}>Head of Department (HoD)</span>
        <h3 className={styles.headName}>{member.name}</h3>
        <p className={styles.personTitle}>{member.title}</p>
        {member.qualifications?.length ? (
          <ul className={styles.quals}>
            {member.qualifications.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}

/** The programme coordinators: one card each, with links to the programmes they coordinate. */
export function CoordinatorCards({
  members,
  programmeNames,
  programmeHref,
}: {
  members: TeamMember[]
  programmeNames: Map<string, string>
  programmeHref: (slug: string) => string
}) {
  return (
    <ul className={styles.coordinators}>
      {members.map((m) => (
        <li key={m.id} className={styles.coordCard}>
          <Portrait member={m} className={styles.coordPortrait} />
          <div className={styles.coordBody}>
            <span className={styles.roleTag}>Coordinator</span>
            <h3 className={styles.coordName}>{m.name}</h3>
            <p className={styles.personTitle}>{m.title}</p>
            {m.qualifications?.map((q) => (
              <p key={q} className={styles.coordQual}>
                {q}
              </p>
            ))}
            <ul className={styles.coordProgs}>
              {coordinatesLabel(m, programmeNames).map((c) => (
                <li key={c.slug}>
                  <SiteLink href={programmeHref(c.slug)}>{c.name}</SiteLink>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** A compact coordinator card for a programme page. */
export function CoordinatorNote({ member }: { member: TeamMember }) {
  return (
    <aside className={styles.coordNote} aria-label="Programme coordinator">
      <Portrait member={member} className={styles.notePortrait} sizes="96px" />
      <div>
        <span className={styles.roleTag}>Coordinator</span>
        <p className={styles.coordName}>{member.name}</p>
        <p className={styles.personTitle}>{member.title}</p>
        {member.qualifications?.map((q) => (
          <p key={q} className={styles.coordQual}>
            {q}
          </p>
        ))}
      </div>
    </aside>
  )
}

const FEED_COLUMNS = [
  { key: 'news', title: 'News', all: '/news', allLabel: 'All news', empty: 'No news for this department yet.' },
  { key: 'events', title: 'Events', all: '/events', allLabel: 'All events', empty: 'No upcoming events yet.' },
  { key: 'notices', title: 'Notices', all: '/notices', allLabel: 'All notices', empty: 'No notices at the moment.' },
] as const

const feedDate = (key: string, i: ListItem) =>
  key === 'events' ? formatDateTime(i.startsAt) : formatDate(i.publishedAt)

/** Department news, events and notices in three columns. */
export function DeptFeed({ feed }: { feed: DepartmentFeed }) {
  return (
    <div className={styles.feed}>
      {FEED_COLUMNS.map((c) => (
        <section key={c.key} className={styles.feedCol} aria-labelledby={`feed-${c.key}`}>
          <h3 id={`feed-${c.key}`} className={styles.feedTitle}>
            {c.title}
          </h3>
          {feed[c.key].length ? (
            <ul className={styles.feedList}>
              {feed[c.key].map((i) => (
                <li key={i.id}>
                  <SiteLink href={`/${c.key}/${encodeURIComponent(i.slug)}`} className={styles.feedLink}>
                    {i.title}
                  </SiteLink>
                  <span className={styles.feedMeta}>
                    {[feedDate(c.key, i), c.key === 'events' ? i.venue : null].filter(Boolean).join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.feedEmpty}>{c.empty}</p>
          )}
          <SiteLink href={c.all} className={styles.feedAll}>
            {c.allLabel} →
          </SiteLink>
        </section>
      ))}
    </div>
  )
}
