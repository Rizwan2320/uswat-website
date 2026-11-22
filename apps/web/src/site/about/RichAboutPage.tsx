import styles from '../academics/Academics.module.css'
import { Band, BannerHeader, Chips, Cta, IconCards, PictureCard, Prose, Hero, SectionNav, Stats } from '../academics/blocks'
import { Sources, Story } from '../offices/blocks'
import { officeHero } from '../offices/art'
import { ADMINISTRATION_PATH, RESEARCH_PATH } from '../offices/landings'

import offices from '../offices/Offices.module.css'

import { ABOUT, MESSAGE, MESSAGE_PATH } from './data'

/* T2 landing for /about: the story, vision and mission of the university, from its own About page. */
export default function RichAboutPage() {
  const nav = [
    { id: 'history', label: 'History' },
    { id: 'vision', label: 'Vision and mission' },
    { id: 'values', label: 'Values and objectives' },
    { id: 'valley', label: 'The valley' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'sources', label: 'Sources' },
  ]
  return (
    <div className={styles.root}>
      <BannerHeader banner={ABOUT.banner} crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      <Hero
        art={ABOUT.hero}
        badge="About"
        lead={ABOUT.lead}
        actions={[
          { label: 'Read the history', href: '#history' },
          { label: 'Vice Chancellor’s message', href: MESSAGE_PATH, ghost: true },
        ]}
      />
      <Stats items={ABOUT.stats} />
      <SectionNav items={nav} />

      <Band id="history" kicker="About" title="History">
        <Story items={ABOUT.story} />
      </Band>

      <Band id="vision" tint kicker="About" title="Vision and mission">
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Vision</h3>
            <p className={styles.cardText}>{ABOUT.vision}</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Mission</h3>
            <p className={styles.cardText}>{ABOUT.mission}</p>
          </div>
        </div>
        <p className={offices.quote}>“{ABOUT.motto}”</p>
      </Band>

      <Band id="values" kicker="About" title="Values and objectives">
        <div className={offices.stack}>
          <Chips items={ABOUT.values} />
          <Prose paragraphs={ABOUT.objectives} />
        </div>
      </Band>

      <Band id="valley" tint kicker="Where we are" title="The valley of Swat">
        <IconCards items={ABOUT.valley} />
      </Band>

      <Band id="leadership" kicker="About" title="Leadership">
        <ul className={styles.pics}>
          <PictureCard
            art={{ ...officeHero('vice-chancellors-message'), alt: '' }}
            title="Vice Chancellor’s Message"
            href={MESSAGE_PATH}
            tag="Message"
            meta={MESSAGE.person.name}
            text={MESSAGE.lead}
            more="Read the message"
          />
          <PictureCard
            art={officeHero('alumni')}
            title="Alumni Association"
            href="/administration/alumni"
            tag="Alumni"
            text="The university’s alumni association, with its people and how to reach them."
            more="Open the office"
          />
          <PictureCard
            art={officeHero('administration')}
            title="Administration"
            href={ADMINISTRATION_PATH}
            tag="Offices"
            text="The directorates, offices, boards and centres that run the university."
            more="See the offices"
          />
        </ul>
      </Band>

      <Band id="sources" tint kicker="Where this comes from" title="Sources">
        <Sources sources={ABOUT.sources} verifiedAt={ABOUT.verifiedAt} openPoints={ABOUT.openPoints} />
      </Band>

      <div className="container">
        <Cta
          title="Looking for more?"
          text="Research offices, the journal and the digital library are on the Research page. The campuses and the contact directory list where to find people."
          actions={[
            { label: 'Research', href: RESEARCH_PATH },
            { label: 'Contact directory', href: '/contact/directory', ghost: true },
          ]}
        />
      </div>
    </div>
  )
}
