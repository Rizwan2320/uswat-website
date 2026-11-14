import { articleMetadata, articlePage, articleStaticParams } from '@/site/articles/routes'

export const revalidate = 300

export const generateStaticParams = articleStaticParams('notices')
export const generateMetadata = articleMetadata('notices')
export default articlePage('notices')
