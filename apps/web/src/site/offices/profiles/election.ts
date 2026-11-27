import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/election-administrative-officers-and-faculty-members/'

export const election: OfficeProfile = {
  slug: 'election-administrative-officers-and-faculty-members',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Election (Administrative Officers and Faculty Members)',
  shortName: 'Elections',
  lead: 'The notifications, electoral lists, nomination notices and results for the election of administrative officers and faculty members to the university’s authorities.',
  banner: officeBanner('election-administrative-officers-and-faculty-members', 'Election of administrative officers and faculty members. University of Swat.'),
  hero: officeHero('election-administrative-officers-and-faculty-members'),
  stats: [{ value: 3, label: 'election schedules notified' }],
  itemLists: [
    {
      title: 'Notifications and office orders',
      items: [
        'Notification of Election Schedule for the Senate and Syndicate Constituencies of Administrative Officers',
        'Notification of Election Schedule for the Senate and Syndicate Constituencies of One Assistant Professor and One Lecturer (respectively)',
        'Notification of Election Schedule for the Academic Council Constituencies of Two Assistant Professor and Two Lecturer',
        'Re-Office Order of Returning Officer Dr. Umar Hayat',
        'Office Order Returning Officer Mr. Arshad Ali Khan',
      ],
    },
    {
      title: 'Electoral lists',
      items: [
        'Electoral List (Administrative Officer)',
        'Electoral List (Assistant Professors)',
        'Electoral List (Lecturers)',
        'Final Electoral List',
        'Administrative Officer',
        'Assistant Professor',
        'Lecturer',
      ],
    },
    {
      title: 'Nominations',
      items: [
        'Nomination Form',
        'Notice Inviting Nominations on the Prescribed Form (PDF)',
        'Notice Inviting Nominations on the Prescribed Form (MS Word)',
      ],
    },
    {
      title: 'Election results',
      items: [
        'Administrative Officers (Senate and Syndicate) - contested and Uncontested',
        'Faculty Members (Senate and Syndicate) - Uncontested',
        'Academic Council - Contested / Uncontested',
      ],
      note: 'Titles only, as the university’s page names them. The documents are on the university’s page.',
    },
  ],
  people: [],
  milestonesTitle: 'The one date on the page',
  milestones: [
    {
      date: '2020-05-22',
      title:
        'Last day for claims and objections to entries in the electoral list, until 12:00 noon (Friday), in accordance with Section 05 of the University of Peshawar Election to the Authorities of University Statutes, 2016',
    },
  ],
  officialPage: PAGE,
  sources: [{ label: 'Election page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'This is a record of an earlier election round (the only date on the page is in May 2020). The page does not say whether a later round has been held.',
    'The three last entries of the electoral lists (Administrative Officer, Assistant Professor, Lecturer) are listed as the page gives them; the copy that was read does not say what each one links to.',
  ],
}
