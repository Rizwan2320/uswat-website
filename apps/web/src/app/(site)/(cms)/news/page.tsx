import { listingMetadata, listingPage } from '@/site/articles/routes'

export const revalidate = 300

export const generateMetadata = listingMetadata('news')
export default listingPage('news')
