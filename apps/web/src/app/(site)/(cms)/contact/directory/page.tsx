import type { Metadata } from 'next'

import Directory from '@/site/directory/Directory'
import { listContacts } from '@/site/directory/queries'
import { DIRECTORY_PATH } from '@/site/directory/shape'

export const revalidate = 300

export const metadata: Metadata = { title: 'Contact directory', alternates: { canonical: DIRECTORY_PATH } }

export default async function ContactDirectoryPage() {
  return <Directory entries={await listContacts()} />
}
