import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/provost-office/'

export const provost: OfficeProfile = {
  slug: 'provost-office',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Office of the Provost',
  shortName: 'Provost',
  lead: 'Student affairs, discipline and hostels: what the Provost is responsible for, who works in the office and the forms it lists.',
  banner: officeBanner('provost-office', 'Office of the Provost. University of Swat.'),
  hero: officeHero('provost-office'),
  stats: [
    { value: 10, label: 'responsibilities listed' },
    { value: 7, label: 'staff named on the office page' },
    { value: 14, label: 'forms listed' },
  ],
  itemLists: [
    {
      title: 'What the Provost is responsible for',
      items: [
        'The Chairperson of Students Affairs and shall maintain students’ discipline in the University with the help of Proctors.',
        'Propose plan for future need of Hostels etc. for students and staff members.',
        'Member of the University Discipline Committee.',
        'Maintain Hostels Management with the help of Wardens and relevant staff.',
        'Deal cases of students pertaining to the Police and Courts.',
        'In charge of the Co/extracurricular activities of the students.',
        'Convener of the food and market management committee.',
        'Propose regulations relating to the conduct of university students, maintenance of discipline and action for breach of discipline to the Vice-Chancellor; and to perform such other functions as may be prescribed by regulations.',
        'Responsible for issuance of students and faculty ID Cards.',
        'Maintaining Alumni record of the University.',
      ],
    },
    {
      title: 'Forms listed on the office page',
      items: [
        'Final Transcript Clearance Form',
        'Admission Cancellation',
        'Alumni Form',
        'Alumni Fee Slip',
        'Clearance for Internal Examination',
        'Course Registration Form',
        'Hostel Form (Staff)',
        'Hostel Form (Student)',
        'ID Card Form for Fresh Admitted Students',
        'Service Card Form',
        'Service Card Renewal Form (Regular Employees Only)',
        'Student ID Card (Renewal)',
        'Student ID Cards Data Collection Excel Sheet',
        'Students ID Card (Lost)',
      ],
      note: 'Titles only, as the university’s page names them. The forms themselves are on the university’s page.',
    },
  ],
  people: [
    { id: 'muhammad-imad-khan', name: 'Dr. Muhammad Imad Khan', title: 'Provost and In-charge Guest House' },
    { id: 'shahid-khan', name: 'Mr. Shahid Khan', title: 'Additional Provost' },
    { id: 'neelam-akbar-marwat', name: 'Dr. Neelam Akbar Marwat', title: 'Deputy Provost' },
    { id: 'akhtar-rasool', name: 'Dr. Akhtar Rasool', title: 'Warden Boys Hostel' },
    { id: 'mahrukh-anum', name: 'Dr. Mahrukh Anum', title: 'Warden Girls Hostel' },
    { id: 'rohi-naz', name: 'Ms. Rohi Naz', title: 'Warden Female Hostel' },
    { id: 'fazal-rahman', name: 'Mr. Fazal Rahman', title: 'Office Assistant' },
  ],
  address: 'Main Campus, Charbagh, Swat',
  emails: ['provost@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Provost’s Office page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no telephone number or hours.',
    'The page lists personal e-mails for several staff; only the office address is shown here.',
  ],
}
