import styles from '../academics/Academics.module.css'
import { Band, BannerHeader, Cta, Hero, Prose, SectionNav } from '../academics/blocks'
import { PeopleCards, Sources } from '../offices/blocks'

import { ABOUT_PATH, MESSAGE } from './data'

/* The Vice Chancellor's message, in full, as the university's page gives it. */
export default function RichMessagePage() {
  return (
    <div className={styles.root}>
      <BannerHeader
        banner={MESSAGE.banner}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About', href: ABOUT_PATH }, { label: 'Vice Chancellor’s Message' }]}
      />
      <Hero
        art={MESSAGE.hero}
        badge="Message"
        lead={MESSAGE.lead}
        actions={[
          { label: 'Read the message', href: '#message' },
          { label: 'About the university', href: ABOUT_PATH, ghost: true },
        ]}
      />
      <SectionNav items={[{ id: 'message', label: 'The message' }, { id: 'sources', label: 'Sources' }]} />

      <Band id="message" kicker="Vice Chancellor" title="A message from the Vice Chancellor">
        <Prose paragraphs={MESSAGE.paragraphs} />
        <PeopleCards people={[MESSAGE.person]} />
      </Band>

      <Band id="sources" tint kicker="Where this comes from" title="Sources">
        <Sources sources={MESSAGE.sources} verifiedAt={MESSAGE.verifiedAt} />
      </Band>

      <div className="container">
        <Cta
          title="Learn about the university"
          text="Its history, vision and mission are on the About page."
          actions={[{ label: 'About the university', href: ABOUT_PATH }]}
        />
      </div>
    </div>
  )
}
