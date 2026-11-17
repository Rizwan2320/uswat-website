import type { Metadata } from 'next'

import Accordion from '@/site/components/kit/Accordion'
import Breadcrumbs from '@/site/components/kit/Breadcrumbs'
import PageHeader from '@/site/components/kit/PageHeader'
import Pagination from '@/site/components/kit/Pagination'
import Prose from '@/site/components/kit/Prose'
import Tabs from '@/site/components/kit/Tabs'

import styles from './design.module.css'

export const metadata: Metadata = {
  title: 'Style guide',
  description: 'Colours, type and components used across the University of Swat site.',
  robots: { index: false, follow: false },
}

const swatches = [
  ['Ivory', '#FCFAF4', '--ivory'],
  ['Forest', '#003B17', '--forest'],
  ['Gold', '#F2B705', '--gold'],
  ['Forest deep', '#002A10', '--forest-deep'],
  ['Forest soft', '#0B5A27', '--forest-soft'],
  ['Ivory deep', '#F3EFE3', '--ivory-deep'],
  ['Gold light', '#FFD84D', '--gold-light'],
  ['Maroon', '#7A1F26', '--maroon'],
] as const

/* Style guide (plan P2 deliverable). Every inner-page component appears here once, with real markup, so reviewers and the
   Playwright baselines can check the whole kit on one page. Not indexed. */
export default function DesignPage() {
  return (
    <>
      <PageHeader
        title="Style guide"
        lede="The colours, type and components every page of the site is built from. This page is for reviewers and is not listed in search."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Style guide' }]}
      />
      <div className={`container ${styles.page}`}>
        <section aria-labelledby="d-colour">
          <h2 id="d-colour" className="section-title">Colour</h2>
          <ul className={styles.swatches}>
            {swatches.map(([name, hex, token]) => (
              <li key={token} className={styles.swatch}>
                <span className={styles.chip} style={{ background: hex }} aria-hidden="true" />
                <strong>{name}</strong>
                <code>{token}</code>
                <span>{hex}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="d-type">
          <h2 id="d-type" className="section-title">Type</h2>
          <div className={styles.card}>
            <p className={styles.display}>Aspiring for Quality Education with Relevance</p>
            <p>Body text is Lato at 1 rem: Join a vibrant academic community committed to excellence, innovation and service to society.</p>
          </div>
        </section>

        <section aria-labelledby="d-buttons">
          <h2 id="d-buttons" className="section-title">Buttons</h2>
          <div className={`${styles.card} ${styles.row}`}>
            <a className="btn btn--gold" href="#d-buttons">Primary</a>
            <a className="btn btn--forest" href="#d-buttons">Secondary</a>
            <a className="btn btn--outline-dark" href="#d-buttons">Outline</a>
            <span className={styles.onDark}><a className="btn btn--outline-light" href="#d-buttons">On dark</a></span>
          </div>
        </section>

        <section aria-labelledby="d-cards">
          <h2 id="d-cards" className="section-title">Cards</h2>
          <div className={styles.cards}>
            <article className={`pop ${styles.card}`}>
              <h3>Card that can lift</h3>
              <p>White, soft shadow, gold ring on hover and keyboard focus. Use for linked cards.</p>
            </article>
            <article className={styles.card}>
              <h3>Static card</h3>
              <p>The same surface without the lift, for bars and reading blocks.</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="d-crumbs">
          <h2 id="d-crumbs" className="section-title">Breadcrumbs</h2>
          <div className={styles.card}>
            <Breadcrumbs label="Example breadcrumb" items={[{ label: 'Home', href: '/' }, { label: 'Academics', href: '/academics' }, { label: 'Computer and Software Technology' }]} />
          </div>
        </section>

        <section aria-labelledby="d-acc">
          <h2 id="d-acc" className="section-title">Accordion</h2>
          <Accordion
            defaultOpen={['a1']}
            items={[
              { id: 'a1', title: 'How does the accordion behave?', content: <p>One panel is open at a time. Up and Down arrows, Home and End move between headings.</p> },
              { id: 'a2', title: 'Can several panels be open?', content: <p>Yes, when the component is given the multiple option.</p> },
              { id: 'a3', title: 'Is it keyboard accessible?', content: <p>Each heading is a button with aria-expanded and a labelled region.</p> },
            ]}
          />
        </section>

        <section aria-labelledby="d-tabs">
          <h2 id="d-tabs" className="section-title">Tabs</h2>
          <Tabs
            label="Example tabs"
            items={[
              { id: 'one', label: 'Overview', content: <p>Left and Right arrows move between tabs (reversed in right-to-left). Home and End jump to the first and last.</p> },
              { id: 'two', label: 'Admissions', content: <p>Only the active tab is in the tab order; the panel itself can be focused.</p> },
              { id: 'three', label: 'Contact', content: <p>Tabs activate as soon as they are focused.</p> },
            ]}
          />
        </section>

        <section aria-labelledby="d-pag">
          <h2 id="d-pag" className="section-title">Pagination</h2>
          <Pagination page={4} pageCount={9} hrefFor={(n) => `#page-${n}`} />
        </section>

        <section aria-labelledby="d-prose">
          <h2 id="d-prose" className="section-title">Article text</h2>
          <div className={styles.card}>
            <Prose>
              <h2>A heading inside an article</h2>
              <p>Reading text is set on a comfortable measure. <a href="#d-prose">Links</a> are forest green and underlined.</p>
              <blockquote>Quotations use the serif face with a maroon rule.</blockquote>
              <ul>
                <li>Lists keep a tight rhythm.</li>
                <li>Tables and images follow the same rules.</li>
              </ul>
            </Prose>
          </div>
        </section>
      </div>
    </>
  )
}
