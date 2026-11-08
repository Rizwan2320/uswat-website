import type { NavItem } from './types'

/* Mockup labels (the redesign keeps them) with real uswat.edu.pk destinations from the public site's menu.
   Source: https://uswat.edu.pk/ navigation, crawled 2026-11-06. No internal <Link> points at a route that does not exist yet. */
const U = 'https://uswat.edu.pk'

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Academics',
    href: `${U}/faculty/`,
    external: true,
    children: [
      { label: 'Faculty of Allied Health Sciences', href: `${U}/faculty/`, external: true, icon: 'heart' },
      { label: 'Computer and Software Technology', href: `${U}/department-of-computer-and-software-technology/`, external: true, icon: 'laptop' },
      { label: 'Management & Commerce', href: `${U}/department-of-management-commerce/`, external: true, icon: 'trending' },
      { label: 'English and Foreign Languages', href: `${U}/department-of-english-and-foreign-languages/`, external: true, icon: 'book' },
      { label: 'Academic Calendar', href: `${U}/academic-calendar/`, external: true, icon: 'calendar' },
      { label: 'Central Library', href: `${U}/central-library-office/`, external: true, icon: 'layers' },
    ],
  },
  {
    label: 'Admissions',
    href: 'https://cms1.uswat.edu.pk/admission/program/list',
    external: true,
    children: [
      { label: 'Admission Portal', href: 'https://cms1.uswat.edu.pk/admission/program/list', external: true, icon: 'clipboard' },
      { label: 'Undergraduate Fall 2026 (Phase II)', href: `${U}/2026/10/undergraduate-admissions-fall-2026-phase-ii/`, external: true, icon: 'cap' },
      { label: 'KPEF Scholarship Scheme 2025-26', href: `${U}/2026/11/kpef-merit-cum-inaffordability-scholarship-scheme-2025-26/`, external: true, icon: 'trophy' },
      { label: 'Student Loan Schemes', href: `${U}/2026/10/students-loan-shemes/`, external: true, icon: 'wallet' },
      { label: 'Downloads', href: `${U}/downloads/`, external: true, icon: 'download' },
    ],
  },
  {
    label: 'Research',
    href: `${U}/oric-2/`,
    external: true,
    children: [
      { label: 'Office of Research, Innovation & Commercialization', href: `${U}/oric-2/`, external: true, icon: 'flask' },
      { label: 'Quality Enhancement Cell', href: `${U}/quality-enhancement-cell/`, external: true, icon: 'badge' },
      { label: 'SUJRIS Journal', href: 'https://sujris.uswat.edu.pk/', external: true, icon: 'book' },
      { label: 'Digital Library', href: 'http://www.digitallibrary.edu.pk/uniofswat.html', external: true, icon: 'layers' },
    ],
  },
  {
    label: 'Campus Life',
    href: `${U}/maincampus/`,
    external: true,
    children: [
      { label: 'Main Campus', href: `${U}/maincampus/`, external: true, icon: 'building' },
      { label: 'Women Campus', href: `${U}/women-campus/`, external: true, icon: 'people' },
      { label: 'Hunerkada', href: `${U}/hunerkada-center-for-excellence/`, external: true, icon: 'palette' },
      { label: 'Youth Development Centre', href: `${U}/kamyab-jawan-markaz/`, external: true, icon: 'trending' },
      { label: 'Campus TV', href: 'https://www.youtube.com/@Campus_Tv_UoS', external: true, icon: 'video' },
    ],
  },
  {
    label: 'News & Events',
    href: `${U}/category/latestnews/`,
    external: true,
    children: [
      { label: 'Latest News', href: `${U}/category/latestnews/`, external: true, icon: 'newspaper' },
      { label: 'Announcements', href: `${U}/category/announcements/`, external: true, icon: 'megaphone' },
      { label: 'Events', href: `${U}/category/events/`, external: true, icon: 'calendar' },
      { label: 'Press Releases', href: `${U}/press-release/`, external: true, icon: 'document' },
    ],
  },
  {
    label: 'About',
    href: `${U}/about-university/`,
    external: true,
    children: [
      { label: 'About University', href: `${U}/about-university/`, external: true, icon: 'building' },
      { label: 'Vice Chancellor’s Message', href: `${U}/vice-chancellors-message-2/`, external: true, icon: 'person' },
      { label: 'Affiliated Colleges', href: `${U}/public-sector-affiliated-colleges/`, external: true, icon: 'cap' },
      { label: 'Proctorial Board', href: `${U}/proctorial-board/`, external: true, icon: 'gavel' },
      { label: 'Alumni Association', href: `${U}/alumni/`, external: true, icon: 'people' },
    ],
  },
]

export const topLinks = {
  student: { label: 'Student Portal' },
  faculty: { label: 'Faculty Portal' },
}

export const applyLink = {
  label: 'Apply Here',
  href: 'https://cms1.uswat.edu.pk/admission/program/list',
  external: true,
}

export const footerQuick: { label: string; href: string }[] = [
  { label: 'About Us', href: `${U}/about-university/` },
  { label: 'Academics', href: `${U}/faculty/` },
  { label: 'Admissions', href: 'https://cms1.uswat.edu.pk/admission/program/list' },
  { label: 'Research', href: `${U}/oric-2/` },
  { label: 'Campus Life', href: `${U}/maincampus/` },
]

export const footerUseful: { label: string; href: string }[] = [
  { label: 'News & Events', href: `${U}/category/latestnews/` },
  { label: 'Student Services', href: `${U}/campus-management-system-uswat/` },
  { label: 'Faculty Resources', href: `${U}/e-office/` },
  { label: 'Library', href: `${U}/central-library-office/` },
  { label: 'Contact Us', href: `${U}/contact-list/` },
]
