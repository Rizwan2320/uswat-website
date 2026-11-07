import type { Feed } from './types'

/* Real items from the public site, crawled 2026-11-06. The site only gives the month (in the URL), so no day is shown.
   Notices: https://uswat.edu.pk/category/announcements/ · Jobs: .../category/jobs/ · Tenders: .../category/tender/ */
const V = '2026-11-06'
const U = 'https://uswat.edu.pk'

export const feeds: Feed[] = [
  {
    id: 'notices',
    title: 'Notices',
    viewAllHref: `${U}/category/announcements/`,
    items: [
      {
        id: 'n1',
        title: 'Undergraduate Admissions Fall 2026 (Phase-II)',
        href: `${U}/2026/10/undergraduate-admissions-fall-2026-phase-ii/`,
        month: '2026-10',
        source: `${U}/2026/10/undergraduate-admissions-fall-2026-phase-ii/`,
        verifiedAt: V,
      },
      {
        id: 'n2',
        title: 'KPEF “Merit-cum-Inaffordability” Scholarship Scheme 2025-26',
        href: `${U}/2026/11/kpef-merit-cum-inaffordability-scholarship-scheme-2025-26/`,
        month: '2026-11',
        source: `${U}/2026/11/kpef-merit-cum-inaffordability-scholarship-scheme-2025-26/`,
        verifiedAt: V,
      },
    ],
  },
  {
    id: 'jobs',
    title: 'Jobs',
    viewAllHref: `${U}/category/jobs/`,
    items: [
      {
        id: 'j1',
        title: 'Research Assistant in HEC-NRPU Funded Research Project',
        href: `${U}/2026/09/research-assistant-in-hec-nrpu-funded-research-project/`,
        month: '2026-09',
        source: `${U}/2026/09/research-assistant-in-hec-nrpu-funded-research-project/`,
        verifiedAt: V,
      },
      {
        id: 'j2',
        title: 'Walk in Interview (Fall 2026)',
        href: `${U}/2026/08/walk-in-interview-fall-2026/`,
        month: '2026-08',
        source: `${U}/2026/08/walk-in-interview-fall-2026/`,
        verifiedAt: V,
      },
    ],
  },
  {
    id: 'tenders',
    title: 'Tenders',
    viewAllHref: `${U}/category/tender/`,
    items: [
      {
        id: 't1',
        title: 'Procurement of Paper Reams',
        href: `${U}/2026/09/procurement-of-paper-reams/`,
        month: '2026-09',
        source: `${U}/2026/09/procurement-of-paper-reams/`,
        verifiedAt: V,
      },
      {
        id: 't2',
        title: 'GPC Meeting for Tender No. 32992 dated September 24, 2026',
        href: `${U}/2026/09/gpc-meeting-for-tender-no-32992-dated-september-24-2026/`,
        month: '2026-09',
        source: `${U}/2026/09/gpc-meeting-for-tender-no-32992-dated-september-24-2026/`,
        verifiedAt: V,
      },
    ],
  },
]
