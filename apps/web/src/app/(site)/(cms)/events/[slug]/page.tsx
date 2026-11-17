import { articleMetadata, articlePage, articleStaticParams } from '@/site/articles/routes'

export const revalidate = 300

export const generateStaticParams = articleStaticParams('events')
export const generateMetadata = articleMetadata('events')
export default articlePage('events')
