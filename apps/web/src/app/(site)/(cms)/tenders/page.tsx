import { listingMetadata, listingPage } from '@/site/articles/routes'

export const revalidate = 300

export const generateMetadata = listingMetadata('tenders')
export default listingPage('tenders')
