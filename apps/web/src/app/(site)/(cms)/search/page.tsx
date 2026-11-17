import type { Metadata } from 'next/types'

import { searchSite } from '@/site/search/queries'
import SearchPage from '@/site/search/SearchPage'
import { parseSearchParams } from '@/site/search/shape'

type Args = { searchParams: Promise<{ q?: string | string[]; page?: string | string[] }> }

export default async function Page({ searchParams }: Args) {
  const params = parseSearchParams(await searchParams)
  return <SearchPage params={params} found={await searchSite(params)} />
}

/* A results page is not a page to index: only the form's address is. */
export async function generateMetadata({ searchParams }: Args): Promise<Metadata> {
  const { q } = parseSearchParams(await searchParams)
  return { title: q ? `Search: ${q}` : 'Search', ...(q ? { robots: { index: false, follow: true } } : {}) }
}
