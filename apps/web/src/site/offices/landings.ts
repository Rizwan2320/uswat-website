import type { IconTitled } from '../academics/types'

import { officeBanner, officeHero } from './art'
import type { Source } from './types'

/* Facts for the two landing pages that are not about one office. Same rule as the office profiles: a source and a date for each fact. */

export const RESEARCH_PATH = '/research'
export const ADMINISTRATION_PATH = '/administration'

export const RESEARCH = {
  banner: officeBanner('research', 'Research. University of Swat. Offices, journals and library.'),
  hero: officeHero('research'),
  lead: 'The university’s research offices, its journal and its digital library in one place.',
  /** Links the university’s menu gives under Research. `external` ones open another site. */
  resources: [
    {
      icon: 'book',
      title: 'SUJRIS Journal',
      text: 'The university’s research journal. The Higher Education Commission approved it on 19 March 2025.',
      href: 'https://sujris.uswat.edu.pk/',
      linkLabel: 'Open the journal site',
    },
    {
      icon: 'layers',
      title: 'Digital Library',
      text: 'The university’s page on the national digital library.',
      href: 'http://www.digitallibrary.edu.pk/uniofswat.html',
      linkLabel: 'Open the digital library',
    },
    {
      icon: 'spark',
      title: 'Quality Enhancement Cell',
      text: 'Listed under Research on the university’s menu. Its page opens on the university website.',
      href: 'https://uswat.edu.pk/quality-enhancement-cell/',
      linkLabel: 'Open the page',
    },
  ] as (IconTitled & { href: string; linkLabel: string })[],
  stats: [
    { value: 2, label: 'research offices' },
    { value: 2022, label: 'ORIC recognised by the HEC, highest category' },
    { value: 'Dec 2014', label: 'DASR established' },
    { value: '19 Mar 2025', label: 'HEC approval of SUJRIS' },
  ],
  sources: [
    { label: 'ORIC page, University of Swat', url: 'https://uswat.edu.pk/oric-2/' },
    { label: 'DASR page, University of Swat', url: 'https://uswat.edu.pk/advanced-studies-and-research-board/' },
    { label: 'Directorate of IT page (the SUJRIS approval is dated there)', url: 'https://uswat.edu.pk/directorate-of-it/' },
    { label: 'University of Swat menu, Research (read 6 November 2026)', url: 'https://uswat.edu.pk/' },
  ] as Source[],
  verifiedAt: '2026-11-05',
}

export const ADMINISTRATION = {
  banner: officeBanner('administration', 'Administration. University of Swat. Directorates, offices and boards.'),
  hero: officeHero('administration'),
  lead: 'The directorates, offices, boards and centres that run the university, with their people and how to reach them.',
  sources: [
    { label: 'Office pages on the University of Swat website (each office page lists its own source)', url: 'https://uswat.edu.pk/' },
  ] as Source[],
  verifiedAt: '2026-11-05',
}
