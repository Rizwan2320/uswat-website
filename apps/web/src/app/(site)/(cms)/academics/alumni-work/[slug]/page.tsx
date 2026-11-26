import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import AlumniWorkPage from '@/site/academics/AlumniWorkPage'
import { ALUMNI_WORKS, alumniHref, alumniWork } from '@/site/academics/alumni'

export const revalidate = 300
export const dynamicParams = false

export const generateStaticParams = () => ALUMNI_WORKS.map((w) => ({ slug: w.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const work = alumniWork((await params).slug)
  if (!work) return { title: 'Alumni work' }
  return { title: work.headline, description: work.summary, alternates: { canonical: alumniHref(work.slug) } }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const work = alumniWork((await params).slug)
  if (!work) notFound()
  return <AlumniWorkPage work={work} />
}
