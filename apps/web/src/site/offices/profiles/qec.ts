import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/quality-enhancement-cell/'

export const qec: OfficeProfile = {
  slug: 'quality-enhancement-cell',
  lists: [],
  path: '/administration/quality-enhancement-cell',
  trail: [{ label: 'Administration', href: '/administration' }],
  group: 'Offices and boards',
  name: 'Quality Enhancement Cell',
  shortName: 'Quality Enhancement Cell',
  lead: 'Promotes public confidence that the quality and standards of the university’s degrees are enhanced and safeguarded.',
  banner: officeBanner('quality-enhancement-cell', 'Quality Enhancement Cell. University of Swat.'),
  hero: officeHero('quality-enhancement-cell'),
  stats: [
    { value: 5, label: 'staff listed' },
    { value: 4, label: 'training events with dates' },
    { value: 10, label: 'accreditation entries listed' },
  ],
  servicesTitle: 'What the cell is responsible for',
  services: [
    { icon: 'shield', title: 'Public confidence', text: 'Promoting public confidence that the quality and standards of the award of degrees are enhanced and safeguarded.' },
    { icon: 'book', title: 'Teaching and learning', text: 'Review of quality standards and the quality of teaching and learning in each subject area.' },
    { icon: 'network', title: 'Academic affiliations', text: 'Review of academic affiliations with other institutions in terms of effective management of standards and quality of programs.' },
    { icon: 'search', title: 'Standards for reviews', text: 'Defining clear and explicit standards as points of reference to the reviews to be carried out; they also help employers know what to expect from candidates.' },
    { icon: 'cap', title: 'Qualifications framework', text: 'Setting out the attributes and abilities that can be expected from the holder of a qualification: Bachelors, Bachelor with honors, Master’s, M.Phil., Doctoral.' },
    { icon: 'layers', title: 'Programme specifications', text: 'Standards clarifying what knowledge, understanding, skills and other attributes a student will have developed on successfully completing a specific program.' },
    { icon: 'chart', title: 'Quality assurance process', text: 'Methods of evaluation to affirm that the quality of provision and the standards of awards are maintained, and to foster curriculum, subject and staff development, together with research and other scholarly activities.' },
    { icon: 'globe', title: 'Fit with national arrangements', text: 'Ensuring that the university’s quality assurance procedures fit in with the arrangements in place nationally for maintaining and improving the quality of Higher Education.' },
    {
      icon: 'gear',
      title: 'Procedures',
      text: 'Approval of new programs; annual monitoring and evaluation, including program monitoring, faculty monitoring and students’ perception; review; student feedback; employer feedback; quality assurance of Master’s, M.Phil and Ph.D programs; subject review; institutional assessment; program specifications; quality framework.',
    },
  ],
  itemLists: [
    {
      title: 'Accreditation entries the page lists',
      items: [
        '2026: BS Forestry 2026–28, NAEAC Certificate of Accreditation',
        '2025: NCEAC, BS Computer Science 2025',
        '2025: NCEAC, BS Information Technology 2025',
        '2025: NCEAC, BS Software Engineering 2025',
        '2024: BS Forestry 2024–25, NAEAC Certificate of Accreditation',
        '2024: BS Computer Science, NCEAC',
        '2024: Women Campus Accreditation NOC',
        '2024: NACTE, BEd Hons (2024–2026)',
        '2021: BS Forestry',
        '2017: Accreditation of the LLB Program by the Pakistan Bar Council',
      ],
      note: 'The certificates themselves are on the university’s page.',
    },
    {
      title: 'Calendars and newsletters the page lists',
      items: [
        'QEC Calendar 2025–26, 2024–25 and 2023–24',
        'QEC News Letter 2025–26, 2024–25, 2023–24 and 2022–23',
      ],
    },
    {
      title: 'Policies and manuals the page lists',
      items: [
        'Quality Policy University of Swat, and the Quality Policy Statement',
        'Self Assessment Manual, and the HEC Institutional Performance Evaluation Manual',
        'Anti Plagiarism Policy adoption',
        'Fee Refund Policy adoption',
        'Registration Transfer Policy and Undergraduate Education Policy',
        'Graduate Education Policy and the degree format for the Associate Degree',
        'Lists of Board of Studies curricula revised, 2023–24, 2024–25 and 2025–26',
      ],
      note: 'The page lists more documents than this, among them the program team lists and the self-assessment submission status for 2023–24, 2024–25 and 2025–26.',
    },
  ],
  people: [
    { id: 'muhammad-tariq-qec', name: 'Dr. Muhammad Tariq', title: 'Director (QEC)' },
    { id: 'muhammad-arshad-ali', name: 'Mr. Muhammad Arshad Ali', title: 'Deputy Director' },
    { id: 'zahid-ullah', name: 'Dr. Zahid Ullah', title: 'Deputy Director (QEC)' },
    { id: 'jawad-hussain', name: 'Mr. Jawad Hussain', title: 'Data Analyst' },
    { id: 'shujaat-ali-qec', name: 'Mr. Shujaat Ali', title: 'PA to Director' },
  ],
  milestonesTitle: 'Capacity building, as the page reports it',
  milestones: [
    { date: '2025-12-09', title: 'One-day training on writing Self-Assessment Reports in line with PREE Standards, with 50 QEC focal persons of affiliated colleges and Program Team members of the Main and Women Campuses' },
    { date: '2025-10-30', title: 'Briefing session on collaborative research, internship and externship opportunities at Akhuwaat Islamic Microfinance Institution, with ORIC and the Faculty of Management and Social Sciences' },
    { date: '2025-02-27', title: 'Training on Program Review for Effectiveness and Enhancement (PREE) for the Program Teams of five piloted departments and QEC focal persons of affiliated colleges' },
    { date: '2024-05-20', title: 'One-day training for faculty and sub-campuses: “Embracing Change: Exploring the Link Between Quality Culture and the Revised PSG-2023 Framework”' },
  ],
  address: 'Administration Block, Main Campus at Charbagh, Swat',
  hours: '08:30 AM – 04:30 PM, Monday – Friday',
  emails: ['qec@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Quality Enhancement Cell page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page also reports an interactive session on the Graduate Education Policy 2023 (effective 10 July 2023) with no date, so it is not in the dated list.',
    'The page gives no telephone number. It also lists the program teams by department and the QEC focal persons of affiliated colleges; those lists are on the university’s page and are not copied here.',
  ],
}
