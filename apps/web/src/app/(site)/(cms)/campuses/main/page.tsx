import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('maincampus')
export default function Page() {
  return <PageProfileRoute slug="maincampus" />
}
