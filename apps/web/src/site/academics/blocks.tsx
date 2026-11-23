import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { T } from '../components/I18n'
import SafeImage from '../components/SafeImage'
import Accordion from '../components/kit/Accordion'
import Tabs from '../components/kit/Tabs'

import Breadcrumbs, { type Crumb } from '../components/kit/Breadcrumbs'
import { dateBlock, itemDate } from '../lib/dates'
import type { ListItem } from '../articles/where'

import { ArrowRightIcon, CalendarIcon, MegaphoneIcon, NewspaperIcon } from '../components/icons'
import eventStyles from '../components/NewsEvents.module.css'
import feedStyles from '../components/FeedCards.module.css'

import AcademicIcon from './AcademicIcon'
import HeroPhotos from './HeroPhotos'
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
  photo,
}: {
  art: Art
  /** A photograph on the left of the card that fades into the green illustration on its right. */
  photo?: Art
  badge: string
  lead: string
  facts?: [string, string][]
  actions: { label: string; href: string; ghost?: boolean }[]
}) {
  return (
    <div className="container">
      <div className={styles.heroWrap}>
        <div className={photo ? `${styles.hero} ${styles.heroWithPhotos}` : styles.hero}>
          {photo ? (
            <div className={styles.heroCardPhoto} aria-hidden="true">
              <SafeImage src={photo.src} alt="" fill sizes="(max-width: 860px) 100vw, 720px" priority />
            </div>
          ) : null}
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

/** The first hero section: the page's banner fills the whole band edge to edge, with the breadcrumbs over its top edge.
    The title is in the picture, so the h1 holds the picture and its alt text is the title. On phones the picture is
    shown whole (16:9) under the breadcrumbs. */
export function BannerHeader({
  banner,
  crumbs,
  hideCrumbs = false,
  photos,
}: {
  banner: Art
  crumbs: Crumb[]
  /** Pictures that rotate every seven seconds on the left of the band and fade into the banner on their right, the way
      the landing page's pictures fade into its green. The banner picture then fills the right part of the band, so its
      title is set smaller. Phones show the plain banner. */
  photos?: Art[]
  /** Academic pages show no green strip under the navigation. The trail stays in the page for screen readers. */
  hideCrumbs?: boolean
}) {
  return (
    <header className={styles.bannerHeader}>
      <h1 className={photos?.length ? `${styles.bannerTitle} ${styles.bannerSplit}` : styles.bannerTitle}>
        {photos?.length ? <HeroPhotos photos={photos} className={styles.bannerPhotos} /> : null}
        <div className={photos?.length ? styles.bannerPic : styles.bannerPicFull}>
          <SafeImage
            src={banner.src}
            alt={banner.alt}
            fill
            sizes="100vw"
            priority
            className={styles.bannerImg}
          />
        </div>
      </h1>
      <div className={hideCrumbs ? `${styles.bannerCrumbs} ${styles.crumbsHidden}` : styles.bannerCrumbs}>
        <div className="container">
          <Breadcrumbs items={crumbs} tone="dark" />
        </div>
      </div>
    </header>
  )
}

/** Department news, events and notices, in the cards of the landing page (FeedCards and the events card of NewsEvents). */
export function DeptFeed({ feed }: { feed: DepartmentFeed }) {
  const when = (i: ListItem) => (i.publishedAt ? { dateISO: i.publishedAt } : {})
  const row = (type: 'news' | 'notices', i: ListItem) => {
    const d = itemDate(when(i))
    return (
      <li key={i.id} className={`row ${feedStyles.row}`}>
        <SiteLink href={`/${type}/${encodeURIComponent(i.slug)}`} className={feedStyles.link}>
          <span className={`dot ${feedStyles.dot}`} aria-hidden="true" />
          <span className={`row-title ${feedStyles.rowTitle}`}>{i.title}</span>
          {d ? (
            <time className={feedStyles.date} dateTime={d.dateTime}>
              {d.label}
            </time>
          ) : null}
        </SiteLink>
      </li>
    )
  }
  const head = (id: string, title: string, Icon: typeof NewspaperIcon, all: string) => (
    <header className={feedStyles.head}>
      <span className={`card-icon ${feedStyles.icon}`}>
        <Icon />
      </span>
      <h3 id={id} className={`card-title ${feedStyles.title}`}>
        {title}
      </h3>
      <SiteLink href={all} className={feedStyles.all}>
        View All <ArrowRightIcon className={`card-arrow flip ${feedStyles.allArrow}`} />
      </SiteLink>
    </header>
  )
  return (
    <div className={`${feedStyles.grid} ${styles.feedGrid} pop-grid`}>
      <article className={`pop ${feedStyles.card}`} aria-labelledby="feed-news">
        {head('feed-news', 'News', NewspaperIcon, '/news')}
        {feed.news.length ? (
          <ul className={feedStyles.list}>{feed.news.map((i) => row('news', i))}</ul>
        ) : (
          <p className={feedStyles.empty}>No news for this department yet.</p>
        )}
      </article>

      <article className={`pop ${feedStyles.card}`} aria-labelledby="feed-events">
        {head('feed-events', 'Upcoming Events', CalendarIcon, '/events')}
        {feed.events.length ? (
          <ul className={feedStyles.list}>
            {feed.events.map((i) => {
              const b = dateBlock({ dateISO: i.startsAt ?? i.publishedAt ?? undefined })
              return (
                <li key={i.id} className={`row ${feedStyles.row}`}>
                  <SiteLink href={`/events/${encodeURIComponent(i.slug)}`} className={eventStyles.evLink}>
                    {b ? (
                      <time className={eventStyles.block} dateTime={b.dateTime}>
                        <span className={eventStyles.day}>{b.top}</span>
                        <span className={eventStyles.mon}>{b.bottom}</span>
                      </time>
                    ) : null}
                    <span className={eventStyles.evText}>
                      <span className={`row-title ${eventStyles.evTitle}`}>{i.title}</span>
                      {i.venue ? <span className={eventStyles.venue}>{i.venue}</span> : null}
                    </span>
                  </SiteLink>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className={feedStyles.empty}>No upcoming events yet.</p>
        )}
      </article>

      <article className={`pop ${feedStyles.card}`} aria-labelledby="feed-notices">
        {head('feed-notices', 'Notices', MegaphoneIcon, '/notices')}
        {feed.notices.length ? (
          <ul className={feedStyles.list}>{feed.notices.map((i) => row('notices', i))}</ul>
        ) : (
          <p className={feedStyles.empty}>No notices at the moment.</p>
        )}
      </article>
    </div>
  )
}
