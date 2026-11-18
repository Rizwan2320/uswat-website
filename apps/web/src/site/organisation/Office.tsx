import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import RichText from '@/components/RichText'
import { safeHref } from '@/utilities/safeHref'

import { T } from '../components/I18n'
import PageHeader from '../components/kit/PageHeader'
import Prose from '../components/kit/Prose'

import styles from './Organisation.module.css'
import { Section } from './Pages'
import { SampleNote } from './SamplePill'
import { isSample, rel, str, type Doc } from './shape'

const list = (v: unknown): Doc[] => (Array.isArray(v) ? (v as Doc[]) : [])

/* T7 office: one office or board. Text, head, hours, phone numbers, addresses and documents, each only when it is filled in. */
export default function OfficePage({ doc }: { doc: Doc }) {
  const name = str(doc.name) ?? ''
  const head = rel(doc.head)
  const body = doc.text as DefaultTypedEditorState | null | undefined
  const hasBody = !!body?.root?.children?.length
  const phones = list(doc.phones).flatMap((p) => (str(p.number) && safeHref(`tel:${str(p.number)!.replace(/\s+/g, '')}`) ? [str(p.number)!] : []))
  const emails = list(doc.emails).flatMap((e) => (str(e.email) ? [str(e.email)!] : []))
  const documents = list(doc.documents).flatMap((d) => {
    const href = safeHref(str(d.url))
    const label = str(d.label)
    return href && label ? [{ href, label, key: String(d.id ?? href) }] : []
  })
  const facts: [string, string | null][] = [
    ['Group', str(doc.group)],
    ['Head of office', head && str(head.name) ? `${str(head.name)}${str(head.designation) ? `, ${str(head.designation)}` : ''}` : null],
    ['Hours', str(doc.hours)],
  ]
  return (
    <>
      <PageHeader title={name} crumbs={[{ label: 'Home', href: '/' }, { label: 'Administration' }, { label: name }]} />
      <article className="container">
        <div className={styles.page}>
          {isSample(doc) ? <SampleNote /> : null}
          <dl className={styles.facts}>
            {facts.map(([label, value]) =>
              value ? (
                <div key={label}>
                  <dt><T k={label} /></dt>
                  <dd>{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
          {hasBody ? (
            <Prose>
              <div className={styles.text}>
                <RichText data={body!} enableGutter={false} enableProse={false} />
              </div>
            </Prose>
          ) : null}
          {phones.length || emails.length ? (
            <Section id="contact" title="Contact">
              <ul className={styles.links}>
                {phones.map((n) => (
                  <li key={n}>
                    <a href={`tel:${n.replace(/\s+/g, '')}`}>{n}</a>
                  </li>
                ))}
                {emails.map((e) => (
                  <li key={e}>
                    <a href={`mailto:${e}`}>{e}</a>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
          {documents.length ? (
            <Section id="documents" title="Documents">
              <ul className={styles.links}>
                {documents.map((d) => (
                  <li key={d.key}>
                    <a href={d.href} rel="noopener noreferrer">
                      {d.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      </article>
    </>
  )
}
