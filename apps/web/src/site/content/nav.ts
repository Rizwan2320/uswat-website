import type { NavItem } from './types'

/* Mockup labels (the redesign keeps them) with real uswat.edu.pk destinations from the public site's menu.
   Source: https://uswat.edu.pk/ navigation, crawled 2026-11-06. Where this site now has its own page for an entry (academics, campuses, news,
   notices, events, jobs, tenders, about, contact directory, research, administration and their offices) the entry points there, so a visitor stays on the site; the rest still
   point at the official page and are marked `external`. No internal <Link> points at a route that does not exist (a test checks). */
const U = 'https://uswat.edu.pk'

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Academics',
    href: '/academics',
    children: [
      { label: 'All faculties and programmes', href: '/academics', icon: 'cap' },
      { label: 'Faculty of Allied Health Sciences', href: `${U}/faculty/`, external: true, icon: 'heart' },
      { label: 'Computer and Software Technologies', href: '/academics/departments/dcst', icon: 'laptop' },
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
    href: '/research',
    children: [
      { label: 'Office of Research, Innovation & Commercialization', href: '/administration/oric-2', icon: 'flask' },
      { label: 'Quality Enhancement Cell', href: `${U}/quality-enhancement-cell/`, external: true, icon: 'badge' },
      { label: 'SUJRIS Journal', href: 'https://sujris.uswat.edu.pk/', external: true, icon: 'book' },
      { label: 'Digital Library', href: 'http://www.digitallibrary.edu.pk/uniofswat.html', external: true, icon: 'layers' },
    ],
  },
  {
    /* Not in the mockup. Added at the owner's request on 2026-11-08 because the official site has an Administration menu. Its real
       submenu was not retrievable (see docs/plan/official-data-raw-2026-11-05.md section 6), so the rows are the office pages that
       were read on 2026-11-05 (section 5); the owner should confirm them against the official menu. Since 2026-11-22 the landing and
       each office have their own page on this site (src/site/offices), so the rows stay here and "Explore All" opens /administration. */
    label: 'Administration',
    href: '/administration',
    children: [
      { label: 'Controller of Examinations', href: '/administration/controller-of-examination-office', icon: 'clipboard' },
      { label: 'Directorate of IT', href: '/administration/directorate-of-it', icon: 'laptop' },
      { label: 'Directorate of Works', href: '/administration/directorate-of-works', icon: 'building' },
      { label: 'Directorate of Advanced Studies & Research', href: '/administration/advanced-studies-and-research-board', icon: 'cap' },
      { label: 'Proctorial Board', href: '/administration/proctorial-board', icon: 'gavel' },
    ],
  },
  {
    label: 'Campus Life',
    href: '/campuses/main',
    children: [
      { label: 'Main Campus', href: '/campuses/main', icon: 'building' },
      { label: 'Women Campus', href: '/campuses/women', icon: 'people' },
      { label: 'Hunerkada', href: '/administration/hunerkada-center-for-excellence', icon: 'palette' },
      { label: 'Youth Development Centre', href: '/administration/kamyab-jawan-markaz', icon: 'trending' },
      { label: 'Campus TV', href: 'https://www.youtube.com/@Campus_Tv_UoS', external: true, icon: 'video' },
    ],
  },
  {
    label: 'News & Events',
    href: '/news',
    children: [
      { label: 'Latest News', href: '/news', icon: 'newspaper' },
      { label: 'Announcements', href: '/notices', icon: 'megaphone' },
      { label: 'Events', href: '/events', icon: 'calendar' },
      { label: 'Jobs', href: '/jobs', icon: 'clipboard' },
      { label: 'Tenders', href: '/tenders', icon: 'document' },
      { label: 'Press Releases', href: `${U}/press-release/`, external: true, icon: 'document' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'About University', href: '/about', icon: 'building' },
      { label: 'Contact Directory', href: '/contact/directory', icon: 'people' },
      { label: 'Vice Chancellor’s Message', href: '/about/vice-chancellors-message', icon: 'person' },
      { label: 'Affiliated Colleges', href: `${U}/public-sector-affiliated-colleges/`, external: true, icon: 'cap' },
      { label: 'Alumni Association', href: '/administration/alumni', icon: 'people' },
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
  { label: 'About Us', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Admissions', href: 'https://cms1.uswat.edu.pk/admission/program/list' },
  { label: 'Research', href: '/research' },
  { label: 'Campus Life', href: '/campuses/main' },
]

export const footerUseful: { label: string; href: string }[] = [
  { label: 'News & Events', href: '/news' },
  { label: 'Student Services', href: `${U}/campus-management-system-uswat/` },
  { label: 'Faculty Resources', href: `${U}/e-office/` },
  { label: 'Library', href: `${U}/central-library-office/` },
  { label: 'Contact Us', href: '/contact/directory' },
]
