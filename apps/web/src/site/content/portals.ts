import type { Portal } from './types'
import { site } from './site'

/* Real portal hosts found on https://uswat.edu.pk/ (crawled 2026-11-06):
   CMS (Campus Management System) cms1.uswat.edu.pk, Examination exam.uswat.edu.pk. */
export const portals: Portal[] = [
  {
    id: 'academic',
    title: 'Academic Portal',
    description: 'Access courses, results and academic records',
    href: site.portalLinks.student,
    icon: 'book',
  },
  {
    id: 'faculty',
    title: 'Faculty Portal',
    description: 'Manage teaching, research and profiles',
    href: site.portalLinks.faculty,
    icon: 'badge',
  },
  {
    id: 'admission',
    title: 'Admission Portal',
    description: 'Apply online and track your applications',
    href: 'https://cms1.uswat.edu.pk/admission/program/list',
    icon: 'document',
  },
  {
    id: 'exam',
    title: 'Examination System',
    description: 'View exam schedules and results',
    href: 'http://exam.uswat.edu.pk/',
    icon: 'calendar',
  },
  {
    id: 'services',
    title: 'Student Services',
    description: 'Explore services and support resources',
    // TODO(content): confirm the right destination for "Student Services".
    href: 'https://uswat.edu.pk/campus-management-system-uswat/',
    icon: 'gear',
  },
]
