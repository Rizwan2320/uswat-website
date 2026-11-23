import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('english-and-foreign-languages')
export default function Page() {
  return <PageProfileRoute slug="english-and-foreign-languages" />
}
