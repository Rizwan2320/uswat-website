import { PageProfileRoute, pageProfileMetadata } from '@/site/organisation/routes'

export const revalidate = 300

export const metadata = pageProfileMetadata('quality-enhancement-cell')
export default function Page() {
  return <PageProfileRoute slug="quality-enhancement-cell" />
}
