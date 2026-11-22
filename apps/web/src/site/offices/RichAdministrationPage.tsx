import styles from '../academics/Academics.module.css'
import { Band, BannerHeader, Cta, Hero, PictureCard, SectionNav, Stats } from '../academics/blocks'
import { officeHref } from '../organisation/shape'

import { Sources } from './blocks'
import { ADMINISTRATION, RESEARCH_PATH } from './landings'
import { officesByGroup, officesListedOn } from './profiles'

/* T2 section landing for /administration: the offices that have a profile, by group. */
export default function RichAdministrationPage() {
  const groups = officesByGroup('administration')
  const total = officesListedOn('administration').length
  const people = officesListedOn('administration').reduce((n, o) => n + o.people.length, 0)
  const nav = [...groups.map((g) => ({ id: g.group.toLowerCase().replaceAll(' ', '-'), label: g.group })), { id: 'sources', label: 'Sources' }]
  return (
    <div className={styles.root}>
      <BannerHeader
        banner={ADMINISTRATION.banner}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Administration' }]}
      />
      <Hero
        art={ADMINISTRATION.hero}
        badge="Administration"
        lead={ADMINISTRATION.lead}
        facts={[
          ['Offices', String(total)],
          ['Groups', String(groups.length)],
        ]}
        actions={[
          { label: 'See the offices', href: `#${nav[0].id}` },
          { label: 'Research offices', href: RESEARCH_PATH, ghost: true },
        ]}
      />
      <Stats
        items={[
          { value: total, label: 'offices with a page' },
          { value: groups.length, label: 'groups' },
          { value: people, label: 'people named' },
        ]}
      />
      <SectionNav items={nav} />

      {groups.map((g, i) => (
        <Band
          key={g.group}
          id={g.group.toLowerCase().replaceAll(' ', '-')}
          tint={i % 2 === 1}
          kicker="Administration"
          title={g.group}
        >
          <ul className={styles.pics}>
            {g.items.map((o) => (
              <PictureCard
                key={o.slug}
                art={o.hero}
                title={o.name}
                href={officeHref(o.slug)}
                tag={o.shortName}
                meta={`${o.people.length} ${o.people.length === 1 ? 'person' : 'people'} listed`}
                text={o.lead}
                more="Open the office"
              />
            ))}
          </ul>
        </Band>
      ))}

      <Band id="sources" tint={groups.length % 2 === 1} kicker="Where this comes from" title="Sources">
        <Sources sources={ADMINISTRATION.sources} verifiedAt={ADMINISTRATION.verifiedAt} />
      </Band>

      <div className="container">
        <Cta
          title="Looking for research?"
          text="The Office of Research, Innovation and Commercialization, the Directorate of Advanced Studies and Research, the journal and the library are on the Research page."
          actions={[{ label: 'Research', href: RESEARCH_PATH }]}
        />
      </div>
    </div>
  )
}
