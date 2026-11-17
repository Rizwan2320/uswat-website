import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import ArticlePage from './ArticlePage'
import ListingPage from './ListingPage'
import { TYPES, type ArticleType } from './config'
import { listingHref, parseListingParams } from './params'
import { getArticle, listArticles, newestSlugs, otherArticles, yearRange } from './queries'

/* The route files under (site)/(cms)/{news,notices,events,jobs,tenders} are one-liners over these factories,
   so the five types cannot drift apart. */

type SearchParams = Promise<Record<string, string | string[] | undefined>>
type SlugParams = Promise<{ slug?: string }>

const decode = (slug: string) => {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export const listingPage = (type: ArticleType) =>
  async function Listing({ searchParams }: { searchParams: SearchParams }) {
    const params = parseListingParams(await searchParams, new Date().getUTCFullYear())
    const [listing, years] = await Promise.all([listArticles(type, params), yearRange(type)])
    // A page past the end, or any page after the first of an empty list, is not a page.
    if (params.page > 1 && params.page > listing.totalPages) notFound()
    return <ListingPage type={type} params={params} listing={listing} years={years} />
  }

export const listingMetadata = (type: ArticleType) =>
  async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
    const params = parseListingParams(await searchParams, new Date().getUTCFullYear())
    return { title: TYPES[type].label, alternates: { canonical: listingHref(TYPES[type].path, params) } }
  }

export const articlePage = (type: ArticleType) =>
  async function Article({ params }: { params: SlugParams }) {
    const slug = decode((await params).slug ?? '')
    const doc = await getArticle(type, slug, { draftModeOn: (await draftMode()).isEnabled, headers: await headers() })
    if (!doc) notFound()
    const others = await otherArticles(type, doc.id)
    return <ArticlePage type={type} doc={doc} now={new Date()} others={others} />
  }

export const articleMetadata = (type: ArticleType) =>
  async function generateMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
    const slug = decode((await params).slug ?? '')
    const doc = await getArticle(type, slug, { draftModeOn: (await draftMode()).isEnabled, headers: await headers() })
    if (!doc) return { title: TYPES[type].label }
    const excerpt = typeof doc.excerpt === 'string' ? doc.excerpt.slice(0, 160) : undefined
    return {
      title: String(doc.title ?? TYPES[type].label),
      description: excerpt,
      alternates: { canonical: `/${TYPES[type].path}/${encodeURIComponent(slug)}` },
    }
  }

export const articleStaticParams = (type: ArticleType) => () => newestSlugs(type)
