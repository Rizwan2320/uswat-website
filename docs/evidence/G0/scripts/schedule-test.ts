import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const user = (await payload.find({ collection: 'users', limit: 1 })).docs[0]
// put the page back to draft first
await payload.update({ collection: 'pages', id: 1, data: { _status: 'draft' }, draft: true, locale: 'en' })
let doc = await payload.findByID({ collection: 'pages', id: 1, draft: false, overrideAccess: true })
console.log('before: published copy status =', doc._status)
const waitUntil = new Date(Date.now() + 4000)
const job = await payload.jobs.queue({
  task: 'schedulePublish',
  input: { type: 'publish', doc: { relationTo: 'pages', value: 1 }, user: { relationTo: 'users', value: user.id } },
  waitUntil,
} as any)
console.log('queued job', job.id, 'waitUntil', waitUntil.toISOString())
const early = await payload.jobs.run({ queue: 'default' } as any)
console.log('run before due:', JSON.stringify(early).slice(0, 120))
await new Promise((r) => setTimeout(r, 5000))
const late = await payload.jobs.run({ queue: 'default' } as any)
console.log('run after due:', JSON.stringify(late).slice(0, 200))
doc = await payload.findByID({ collection: 'pages', id: 1, draft: false, overrideAccess: true })
console.log('after: status =', doc._status)
process.exit(0)
