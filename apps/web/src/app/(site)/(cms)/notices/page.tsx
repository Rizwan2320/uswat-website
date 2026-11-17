import { listingMetadata, listingPage } from '@/site/articles/routes'

export const revalidate = 300

export const generateMetadata = listingMetadata('notices')
export default listingPage('notices')
