import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/university-advancement-financial-aid-office/'

export const financialAid: OfficeProfile = {
  slug: 'university-advancement-financial-aid-office',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'University Advancement and Financial Aid Office',
  shortName: 'Financial Aid',
  lead: 'Scholarships on merit and need for students with limited means: what the office does and the ten scholarships and schemes it lists.',
  banner: officeBanner('university-advancement-financial-aid-office', 'University Advancement and Financial Aid Office. University of Swat.'),
  hero: officeHero('university-advancement-financial-aid-office'),
  stats: [
    { value: 10, label: 'scholarships and schemes listed' },
    { value: 3, label: 'staff named on the office page' },
  ],
  about: [
    'Financial Aid Office, University of Swat, was established in compliance with Higher Education Commissions directives in order to facilitate talented and less privilege students for grant of scholarship on merit and need bases. For smooth implementation of scholarship programs, a separate Student Financial Aid Office was established at University of Swat. There are number of scholarships available to assist students with their educational expenses on need and merit basis. In addition to the above Financial Aid Committee has been constituted by this University for the evaluation and approval of the applications submitted by the students for Financial Aid. The students are updated on a regular basis in relation to scholarship advertisement deadline and other procedure for application through department and University official website.',
    'The Students Financial Aid Office is primarily responsible for providing all information. Services, and assembling financial resources that are available to and/or needed by students who are enrolled at University of Swat, but their financial resources are limited. The fundamental purpose of the financial aid program is to make education possible for students who might otherwise be deprived of this higher education opportunity due to inadequate funds and/or previous limited educational opportunities.',
  ],
  itemLists: [
    {
      title: 'What the office sets out to do',
      items: [
        'Establish essential manual and automated process to support awarding financial aid in a timely manner.',
        'Award financial assistance to qualified students, according to institutional and Govt requirements and with a focus on individual student needs.',
        'Establish regular communication flow between the Financial Aid office and the students/parents.',
        'Provide individual student/parent assistance in completing necessary applications and managing personal resources as they are needed to augment financial assistance in covering educational expenses.',
        'Financial Aid resources are those that are provided by both internal (University and/or endowment funds), governmental (PEEF, Professional Education Internal Merit and District Merit Scholarship) and private agencies or organizations.',
      ],
    },
    {
      title: 'Scholarship categories and programmes listed',
      items: [
        'University of Merit Scholarship',
        'HEC French-German-Japanese Need Bases Scholarship',
        'HEC French Need Bases Scholarship',
        'DIYA Pakistan Scholarship',
        'Professional Education Foundation (PEF)',
        'Pakistan Bait-ul-Maal',
        'KP Zakat Department (MORA)',
        'SAFE (Student Advancement Fund Endowment)',
        'NBP Students loan Scheme',
        'Prime Minister’s Fee Reimbursement Scheme',
      ],
      note: 'Students who receive any other financial assistance or scholarship and are admitted on bench fee cannot apply for another scholarship (the page’s own rule).',
    },
  ],
  people: [
    { id: 'umar-hayat', name: 'Dr. Umar Hayat', title: 'Associate Professor and Director' },
    { id: 'khurshid-alam', name: 'Mr. Khurshid Alam', title: 'Manager, Advancement and Financial Aid Office' },
    { id: 'muhammad-kaleem', name: 'Mr. Muhammad Kaleem', title: 'Computer Operator' },
  ],
  officialPage: PAGE,
  sources: [{ label: 'University Advancement and Financial Aid Office page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no office telephone, address, hours, deadlines, amounts or eligibility rules; the scholarships are named only. Confirm with the office before applying.',
    'The page lists personal e-mails for two staff; they are not shown here.',
  ],
}
