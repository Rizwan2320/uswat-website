import { feedResponse } from '@/site/feeds/collect'

export const revalidate = 300

export const GET = () => feedResponse('events')
