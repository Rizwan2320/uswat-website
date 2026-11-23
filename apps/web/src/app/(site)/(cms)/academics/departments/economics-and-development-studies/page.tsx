import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('economics-and-development-studies')
export default function Page() {
  return <PageProfileRoute slug="economics-and-development-studies" />
}
