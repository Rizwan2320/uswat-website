import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('sangota-campus')
export default function Page() {
  return <PageProfileRoute slug="sangota-campus" />
}
