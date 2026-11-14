import { articleMetadata, articlePage, articleStaticParams } from '@/site/articles/routes'

export const revalidate = 300

export const generateStaticParams = articleStaticParams('tenders')
export const generateMetadata = articleMetadata('tenders')
export default articlePage('tenders')
