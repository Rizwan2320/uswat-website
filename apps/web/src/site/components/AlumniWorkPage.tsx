import { safeHref } from '@/utilities/safeHref'

import { alumniWorkPath, type AlumniWork } from '../content/alumni'
import { SampleNote } from '../organisation/SamplePill'
import { T } from './I18n'
import { ArrowRightIcon } from './icons'
import PageHeader from './kit/PageHeader'
import SafeImage from './SafeImage'
import styles from './AlumniWorkPage.module.css'

const crumbs = (last: string) => [{ label: 'Home', href: '/' }, { label: 'Alumni research', href: alumniWorkPath }, { label: last }]

/* One alumnus's thesis or research: photograph, abstract, keywords, and the full text when it is held elsewhere. */
export function AlumniWorkPage({ work }: { work: AlumniWork }) {
  const fullText = safeHref(work.url)
  return (
    <>
      <PageHeader title={work.title} lede={`${work.name} · ${work.department} · ${work.year}`} crumbs={crumbs(work.name)} />
      <article className="container">
        <div className={styles.page}>
          {work.sample ? <SampleNote /> : null}
          <div className={styles.layout}>
            <figure className={styles.photo}>
              <div className={styles.frame}>
                <SafeImage src={work.photo.src} alt={work.photo.alt} fill sizes="(max-width: 767px) 80vw, 280px" className={styles.img} />
              </div>
              <figcaption>
                <strong>{work.name}</strong>
                <span>{work.department}</span>
                <span>{work.year}</span>
              </figcaption>
            </figure>
            <div className={styles.text}>
              <h2 className={styles.heading}><T k="Abstract" /></h2>
              {work.abstract.map((p) => <p key={p}>{p}</p>)}
              <h2 className={styles.heading}><T k="Keywords" /></h2>
              <ul className={styles.keywords}>
                {work.keywords.map((k) => <li key={k}>{k}</li>)}
              </ul>
              <h2 className={styles.heading}><T k="Full text" /></h2>
              {fullText ? (
                <p>
                  <a className={styles.button} href={fullText} rel="noopener noreferrer" target="_blank">
                    <T k="Read the full work" /> <ArrowRightIcon className="flip" />
                  </a>
                </p>
              ) : (
                <p className={styles.muted}><T k="The full text is not attached to this entry." /></p>
              )}
            </div>
          </div>
          <p className={styles.back}><a href={alumniWorkPath}><T k="All alumni research" /></a></p>
        </div>
      </article>
    </>
  )
}

/* The list of every work, same cards as the landing page's section. */
export function AlumniWorkList({ works }: { works: AlumniWork[] }) {
  return (
    <>
      <PageHeader title="Alumni research" lede="Thesis and research by graduates of the University of Swat." crumbs={[{ label: 'Home', href: '/' }, { label: 'Alumni research' }]} />
      <section className="container">
        <div className={styles.page}>
          {works.some((w) => w.sample) ? <SampleNote /> : null}
          <ul className={styles.list}>
            {works.map((w) => (
              <li key={w.slug}>
                <a href={w.url ?? `${alumniWorkPath}/${encodeURIComponent(w.slug)}`}>
                  <strong>{w.title}</strong>
                  <span>{w.name} · {w.department} · {w.year}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
