import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/treasurer-office/'

export const treasurer: OfficeProfile = {
  slug: 'treasurer-office',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Office of the Treasurer',
  shortName: 'Treasurer',
  lead: 'The Treasurer and the accounts, audit, budget and store staff, with the forms and budget documents the page lists.',
  banner: officeBanner('treasurer-office', 'Office of the Treasurer. University of Swat.'),
  hero: officeHero('treasurer-office'),
  stats: [
    { value: 13, label: 'staff named on the office page' },
    { value: 7, label: 'forms and documents listed' },
  ],
  itemLists: [
    {
      title: 'Forms and documents listed on the office page',
      items: [
        'Requisition slip',
        'Requisition slip (PDF)',
        'University of Swat Purchase Requisition Form',
        'Financial Rules (University of Peshawar)',
        'Endowment Fund Rules',
        'Budget estimates for FY 2021-22',
        'Budget estimates, University of Swat, for FY 2022-23 (Plan-B)',
      ],
      note: 'Titles only, as the university’s page names them.',
    },
  ],
  people: [
    { id: 'asif-saud-jan', name: 'Mr. Asif Saud Jan', title: 'Treasurer' },
    { id: 'muhammad-khalid', name: 'Mr. Muhammad Khalid', title: 'Additional Treasurer' },
    { id: 'amjad-iqbal', name: 'Mr. Amjad Iqbal', title: 'Deputy Treasurer / Director Accounts' },
    { id: 'arshad-hussain', name: 'Mr. Arshad Hussain', title: 'Deputy Director Audit' },
    { id: 'sangeen-khan', name: 'Mr. Sangeen Khan', title: 'Deputy Treasurer' },
    { id: 'shahab-khan', name: 'Mr. Shahab Khan', title: 'Deputy Treasurer, deputed to KPRA as Deputy Director Tax Audit' },
    { id: 'mansoor-ahmad', name: 'Mr. Mansoor Ahmad', title: 'Superintendent' },
    { id: 'shoukat-ali', name: 'Mr. Shoukat Ali', title: 'Store Officer' },
    { id: 'rahmanullah', name: 'Mr. Rahmanullah', title: 'Student Accounts Advisor' },
    { id: 'muhammad-imran', name: 'Mr. Muhammad Imran', title: 'Superintendent Budget / PS to Treasurer' },
    { id: 'ziaul-haq', name: 'Mr. Ziaul Haq', title: 'Junior Clerk' },
    { id: 'yousuf-haroon', name: 'Mr. Yousuf Haroon', title: 'Junior Clerk' },
    { id: 'hussain-ali', name: 'Mr. Hussain Ali', title: 'Junior Clerk' },
  ],
  phones: [{ label: 'Treasurer’s office', number: '0946-920857' }],
  emails: ['pstotreasurer@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Treasurer’s Office page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no description of the office, no address and no hours. The documents are named without links in the copy that was read.',
    'The page lists personal e-mails for most staff; only the office address is shown here.',
  ],
}
