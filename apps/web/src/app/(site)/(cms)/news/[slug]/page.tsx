import { articleMetadata, articlePage, articleStaticParams } from '@/site/articles/routes'

export const revalidate = 300

export const generateStaticParams = articleStaticParams('news')
export const generateMetadata = articleMetadata('news')
export default articlePage('news')
