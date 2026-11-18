import { getServerSideSitemap } from 'next-sitemap'

import { contentSitemap } from '@/site/sitemap/collect'

/* Notices, events, jobs, tenders, departments, programmes, offices and the list pages. Pages and News have their own sitemaps. */
export async function GET() {
  return getServerSideSitemap(await contentSitemap())
}
