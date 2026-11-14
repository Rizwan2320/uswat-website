import { articleMetadata, articlePage, articleStaticParams } from '@/site/articles/routes'

export const revalidate = 300

export const generateStaticParams = articleStaticParams('jobs')
export const generateMetadata = articleMetadata('jobs')
export default articlePage('jobs')
