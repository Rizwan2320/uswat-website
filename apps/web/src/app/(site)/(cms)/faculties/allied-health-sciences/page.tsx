import { FacultyRoute, facultyMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = facultyMetadata('allied-health-sciences')
export default function Page() {
  return <FacultyRoute slug="allied-health-sciences" />
}
