import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import RichText from '@/components/RichText'
import { safeHref } from '@/utilities/safeHref'

import { T } from '../components/I18n'
import PageHeader from '../components/kit/PageHeader'
import Prose from '../components/kit/Prose'

import styles from './Articles.module.css'
import { TYPES, type ArticleType } from './config'
import { formatDate, formatDateTime, isClosed } from './format'
import type { ListItem } from './queries'

/* T5 article: one layout for all five types. News stored as `posts` keeps its text in `content`; the others use `body`. */

type Doc = Record<string, unknown>
type Gov = { status?: string | null; expireAt?: string | null } | null | undefined
const text = (v: unknown) => (typeof v === 'string' && v ? v : null)

export default function ArticlePage({ type, doc, now, others }: { type: ArticleType; doc: Doc; now: Date; others: ListItem[] }) {
  const cfg = TYPES[type]
  const gov = doc.governance as Gov
  const title = text(doc.title) ?? ''
  const body = doc[cfg.bodyField] as DefaultTypedEditorState | null | undefined
  const stub = doc.bodyStatus === 'stub' || !body
  const closed = isClosed(gov, now)
  const attachments = cfg.hasAttachments && Array.isArray(doc.attachments) ? (doc.attachments as { id?: string; label?: string; url?: string }[]) : []
  const files = attachments.flatMap((a) => {
    const href = safeHref(a.url)
    return href && a.label ? [{ key: a.id ?? href, href, label: a.label }] : []
  })
  const tags = Array.isArray(doc.tags) ? (doc.tags as unknown[]).flatMap((t) => (t && typeof t === 'object' ? [text((t as Doc).name)].filter((n): n is string => !!n) : [])) : []

  const facts: string[] = []
  if (cfg.kind === 'event') {
    const when = formatDateTime(text(doc.startsAt))
    if (when) facts.push(when)
    if (text(doc.venue)) facts.push(text(doc.venue)!)
  } else {
    const date = formatDate(text(doc.publishedAt))
    if (date) facts.push(date)
    const closes = cfg.kind === 'deadline' ? formatDate(gov?.expireAt) : null
    if (closes) facts.push(`${closed ? 'Closed' : 'Closes'} ${closes}`)
  }

  return (
    <>
      <PageHeader
        title={title}
        lede={text(doc.excerpt) ?? undefined}
        crumbs={[{ label: 'Home', href: '/' }, { label: cfg.label, href: `/${cfg.path}` }, { label: title }]}
      />
      <article className="container">
        <div className={styles.article}>
          {facts.length ? (
            <ul className={styles.facts}>
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}
          {closed ? <p className={styles.notice}>{cfg.closedText}</p> : null}
          {stub ? (
            <p className={styles.stub}>
              <T k="The full text of this item has not been moved to this site yet." />
            </p>
          ) : (
            <Prose>
              <div className={styles.body}>
                <RichText data={body!} enableGutter={false} enableProse={false} />
              </div>
            </Prose>
          )}
          {files.length ? (
            <>
              <h2 className={styles.heading}>
                <T k="Files" />
              </h2>
              <ul className={styles.files}>
                {files.map((f) => (
                  <li key={f.key}>
                    <a href={f.href} rel="noopener noreferrer">
                      {f.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {tags.length ? (
            <ul className={styles.topics} aria-label="Topics">
              {tags.map((t) => (
                <li key={t} className={styles.topic}>
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
          {others.length ? (
            <aside className={styles.more} aria-labelledby="more-heading">
              <h2 id="more-heading" className={styles.heading}>
                <T k="More from" /> {cfg.label}
              </h2>
              <ul className={styles.files}>
                {others.map((o) => (
                  <li key={o.id}>
                    <a className={styles.moreLink} href={`/${cfg.path}/${encodeURIComponent(o.slug)}`}>
                      {o.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </article>
    </>
  )
}
