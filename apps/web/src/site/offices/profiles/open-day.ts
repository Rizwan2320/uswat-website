import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/open-day/'

export const openDay: OfficeProfile = {
  slug: 'open-day',
  path: '/open-day',
  trail: [{ label: 'Campus life', href: '/campuses/main' }],
  lists: [],
  group: 'Academic services',
  name: 'Open Day for Admissions',
  shortName: 'Open Day',
  lead: 'A day on which teachers and staff of every department meet new students and their parents to explain the departments, admission, fees, hostels and transport.',
  banner: officeBanner('open-day', 'Open Day for Admissions. University of Swat.'),
  hero: officeHero('open-day'),
  stats: [{ value: '14 September', label: 'Open Day for Admissions Fall 2022' }],
  about: [
    'The university’s page holds a newspaper report in Urdu (from the Mingora correspondent of Daily Awsaf) on the Open Day for Admissions Fall 2022. This is a summary of it in English.',
    'The Vice Chancellor at the time, Prof. Dr. Hassan Sher, said in a video message for students that the 14 September Open Day was meant to tell the children of Swat and their parents about higher education: which fields a new student can choose, how to take admission, hostel facilities, the teaching system and practical work in the different fields.',
    'He said teachers and other staff of all departments would be present on that day to give new students and their parents information about their departments and about jobs after graduation. Other teachers said that on Open Day students would be told about the fee structure, hostel and transport facilities and how to get admission, which would make it easier for new students to apply and to choose a department.',
    'The report adds that since the new Vice Chancellor arrived the university had moved to the Main Campus at Charbagh, with only a few departments remaining elsewhere.',
  ],
  people: [],
  officialPage: PAGE,
  sources: [{ label: 'Open Day page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives the day and month (14 September) and the admission round (Fall 2022) but no year, time or venue.',
    'The page is a news report from 2022. The university’s events list names later Open Days (2024 and 2026); their details are not on this page.',
  ],
}
