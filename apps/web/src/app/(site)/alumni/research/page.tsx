import type { Metadata } from 'next'

import { AlumniWorkList } from '@/site/components/AlumniWorkPage'
import { alumniWorks } from '@/site/content/alumni'

export const metadata: Metadata = {
  title: 'Alumni research | University of Swat',
  description: 'Thesis and research by graduates of the University of Swat.',
}

export default function Page() {
  return <AlumniWorkList works={alumniWorks} />
}
