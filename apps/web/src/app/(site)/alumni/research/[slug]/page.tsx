import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AlumniWorkPage } from '@/site/components/AlumniWorkPage'
import { alumniWorks, getAlumniWork } from '@/site/content/alumni'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = () => alumniWorks.map((w) => ({ slug: w.slug }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = getAlumniWork((await params).slug)
  if (!work) return { title: 'Page not found | University of Swat' }
  return { title: `${work.title} | University of Swat`, description: work.summary }
}

export default async function Page({ params }: Props) {
  const work = getAlumniWork((await params).slug)
  if (!work) notFound()
  return <AlumniWorkPage work={work} />
}
