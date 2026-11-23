import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('central-library-office')
export default function Page() {
  return <PageProfileRoute slug="central-library-office" />
}
