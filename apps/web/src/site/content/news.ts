import type { NewsItem } from './types'

/* Real headlines from https://uswat.edu.pk/category/latestnews/ (crawled 2026-11-06). Month-only dates: the pages
   show the day in images/PDF only. Images: see content/images.ts (none copied yet). */
const V = '2026-11-06'
const U = 'https://uswat.edu.pk'

export const news: NewsItem[] = [
  {
    id: 'niibs',
    title: 'University of Swat and Sri Lankan NIIBS Sign Landmark MoU to Strengthen Research on Gandhara Civilization',
    href: `${U}/2026/11/university-of-swat-and-sri-lankan-niibs-sign-landmark-mou-to-strengthen-research-on-gandhara-civilization/`,
    month: '2026-11',
    source: `${U}/2026/11/university-of-swat-and-sri-lankan-niibs-sign-landmark-mou-to-strengthen-research-on-gandhara-civilization/`,
    verifiedAt: V,
  },
  {
    id: 'climate',
    title: 'University of Swat Participates in Conference on Climate Resilience at Bara Gali',
    href: `${U}/2026/11/university-of-swat-participates-in-conference-on-climate-resilience-at-bara-gali/`,
    month: '2026-11',
    source: `${U}/2026/11/university-of-swat-participates-in-conference-on-climate-resilience-at-bara-gali/`,
    verifiedAt: V,
  },
  {
    id: 'solar',
    title: 'University of Swat Became the First in the Province to Launch a Major Solarization Project',
    href: `${U}/2026/10/university-of-swat-became-the-first-in-the-province-to-launch-a-major-solarization-project/`,
    month: '2026-10',
    source: `${U}/2026/10/university-of-swat-became-the-first-in-the-province-to-launch-a-major-solarization-project/`,
    verifiedAt: V,
  },
]
