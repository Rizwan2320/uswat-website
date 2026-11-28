import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('affiliated-colleges')
export default function Page() {
  return <PageProfileRoute slug="affiliated-colleges" />
}
