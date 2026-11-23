import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('environmental-sciences')
export default function Page() {
  return <PageProfileRoute slug="environmental-sciences" />
}
