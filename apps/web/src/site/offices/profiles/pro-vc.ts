import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/office-of-the-pro-vice-chancellor-pro-vc/'

export const proVc: OfficeProfile = {
  slug: 'office-of-the-pro-vice-chancellor-pro-vc',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Office of the Pro Vice Chancellor',
  shortName: 'Pro Vice Chancellor’s Office',
  lead: 'The office that supports the Vice Chancellor in the university’s strategic, academic and administrative leadership.',
  banner: officeBanner('office-of-the-pro-vice-chancellor-pro-vc', 'Office of the Pro Vice Chancellor. University of Swat.'),
  hero: officeHero('office-of-the-pro-vice-chancellor-pro-vc'),
  about: [
    'The Office of the Pro Vice Chancellor (ProVC) at the University of Swat plays a vital role in supporting the strategic, academic, and administrative leadership of the university. As a key member of the university’s executive team, the Pro Vice Chancellor assists the Vice Chancellor in achieving the institution’s mission of academic excellence, research innovation, and community engagement.',
    'To promote academic integrity, foster a culture of innovation and excellence, and position the University of Swat as a leading center of higher education and research in the region and beyond.',
    'At the University of Swat, we are committed to creating a transformative educational environment for our students and faculty. The Office of the Pro Vice Chancellor stands at the intersection of strategy and service, working diligently to support academic growth, uphold institutional values, and enhance our regional and global impact.',
  ],
  people: [{ id: 'muhammad-qasim', name: 'Prof. Dr. Muhammad Qasim', title: 'Pro Vice Chancellor' }],
  address: 'Office of the Pro Vice Chancellor, University of Swat, Khyber Pakhtunkhwa, Pakistan',
  officialPage: PAGE,
  sources: [{ label: 'Office of the Pro Vice Chancellor page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: ['The page gives no telephone number, e-mail or hours. The second paragraph is a purpose statement without a heading on the page.'],
}
