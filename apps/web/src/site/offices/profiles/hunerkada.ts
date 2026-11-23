import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/hunerkada-center-for-excellence/'

export const hunerkada: OfficeProfile = {
  slug: 'hunerkada-center-for-excellence',
  lists: ['administration'],
  group: 'Centres and associations',
  name: 'Hunerkada Center of Excellence',
  shortName: 'Hunerkada',
  lead: 'A centre of excellence chaired from Hunerkada, Islamabad, with its own page, phone and e-mail at the university.',
  banner: officeBanner('hunerkada-center-for-excellence', 'Hunerkada Center of Excellence. University of Swat.'),
  hero: officeHero('hunerkada-center-for-excellence'),
  stats: [{ value: 4, label: 'people listed on the centre’s page' }],
  people: [
    { id: 'syed-jamal-shah', name: 'Prof. Syed Jamal Shah', title: 'Chairman, Hunerkada, Islamabad; eminent artist, scholar and educationist' },
    { id: 'amna-shah', name: 'Ms. Amna Shah', title: 'Director, Hunerkada, Islamabad' },
    { id: 'bashir-ahmad', name: 'Prof. Bashir Ahmad', title: 'Eminent international artist and educationist' },
    { id: 'attiya-zafar', name: 'Ms. Attiya Zafar', title: 'HR and Students’ Coordinator' },
  ],
  phones: [{ number: '+92-946-920876' }],
  emails: ['hunerkada@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Hunerkada Center of Excellence page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-05',
  openPoints: ['The page gives no street address for the centre.'],
}
