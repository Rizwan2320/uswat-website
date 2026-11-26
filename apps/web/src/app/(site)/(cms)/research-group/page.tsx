import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('research-group')
export default function Page() {
  return <PageProfileRoute slug="research-group" />
}
