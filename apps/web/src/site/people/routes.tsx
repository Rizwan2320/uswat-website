import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import PeopleDirectory from './PeopleDirectory'
import PersonPage from './PersonPage'
import { getPerson, listAreas, listPeople } from './queries'
import { PEOPLE_PATH, parseArea, parseFilters, personHref } from './shape'

/* The route files under (site)/(cms)/people are one-liners over these (same pattern as organisation/routes). */

type Search = Promise<Record<string, string | string[] | undefined>>
type SlugParams = Promise<{ slug?: string }>
const decode = (slug: string) => {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export async function PeopleListRoute({ searchParams }: { searchParams: Search }) {
  const s = await searchParams
  const [all, areas] = await Promise.all([listPeople(), listAreas()])
  const area = parseArea(s)
  return <PeopleDirectory people={all} areas={areas} initialQuery={parseFilters(s).q} initialArea={areas.some((a) => a.id === area) ? area : ''} />
}

/** Filtered results are not separate pages: they point to the plain list and ask not to be indexed. */
export async function peopleListMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const s = await searchParams
  const filtered = Boolean(s.q || s.area)
  return { title: 'Faculty and staff', alternates: { canonical: PEOPLE_PATH }, ...(filtered ? { robots: { index: false, follow: true } } : {}) }
}

export async function PersonRoute({ params }: { params: SlugParams }) {
  const slug = decode((await params).slug ?? '')
  const person = await getPerson(slug, { draftModeOn: (await draftMode()).isEnabled, headers: await headers() })
  if (!person) notFound()
  return <PersonPage person={person} />
}

export async function personMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const slug = decode((await params).slug ?? '')
  const person = await getPerson(slug, { draftModeOn: (await draftMode()).isEnabled, headers: await headers() })
  return person
    ? { title: person.name, description: person.designation ?? undefined, alternates: { canonical: personHref(person.slug) } }
    : { title: 'Person' }
}
