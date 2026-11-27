import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('convocation-2022')
export default function Page() {
  return <PageProfileRoute slug="convocation-2022" />
}
