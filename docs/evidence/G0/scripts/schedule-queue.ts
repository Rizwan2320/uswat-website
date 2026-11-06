import { getPayload } from 'payload'
import config from '@payload-config'
const payload = await getPayload({ config })
const user = (await payload.find({ collection: 'users', limit: 1 })).docs[0]
await payload.update({ collection: 'pages', id: 1, data: { _status: 'draft' }, draft: true, locale: 'en' })
const waitUntil = new Date(Date.now() + 6000)
const job = await payload.jobs.queue({ task: 'schedulePublish', input: { type: 'publish', doc: { relationTo: 'pages', value: 1 }, user: { relationTo: 'users', value: user.id } }, waitUntil } as any)
console.log('queued', job.id, waitUntil.toISOString())
process.exit(0)
