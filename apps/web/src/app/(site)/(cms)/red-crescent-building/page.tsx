import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('red-crescent-building')
export default function Page() {
  return <PageProfileRoute slug="red-crescent-building" />
}
