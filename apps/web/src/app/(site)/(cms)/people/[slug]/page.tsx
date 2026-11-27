import { PersonRoute, personMetadata } from '@/site/people/routes'

export const revalidate = 300

export const generateMetadata = personMetadata
export default PersonRoute
