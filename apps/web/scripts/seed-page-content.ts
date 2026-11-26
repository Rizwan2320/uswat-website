/**
 * Fills the CMS page content of departments and programmes from the code profiles (slice 3ar), so a head or
 * coordinator starts from what the public page already shows.
 *   pnpm seed:page-content            every profile that has a record
 *   pnpm seed:page-content dcst       one department and its programmes
 *   pnpm seed:page-content dcst --publish   also publish as the local platform admin (a pilot database only)
 * Local database only (assertLocalDatabase). A section that already has content is left alone, so a re-run never
 * overwrites someone's edit. Acts as the system, so the governance hooks run, and the change is saved as a draft
 * (governance requires that for published records); no secret is read or printed.
 */
import { assertLocalDatabase } from '../../../scripts/import/writer'

import { departmentPageContent, programmePageContent } from '../src/collections/academics/profileToCms'
import { departmentProfiles, disciplineProfiles } from '../src/site/academics/profiles'

type Row = Record<string, unknown>
const CONTEXT = { disableRevalidate: true }

const filled = (v: unknown): boolean =>
  Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim().length > 0 : v != null

/** Only the sections the record has not got yet. */
export function missingSections(current: Row | null | undefined, wanted: Row): Row {
  const out: Row = {}
  for (const [key, value] of Object.entries(wanted)) if (!filled(current?.[key])) out[key] = value
  return out
}

async function main(): Promise<void> {
  assertLocalDatabase(process.env.DATABASE_URL)
  const args = process.argv.slice(2)
  const publish = args.includes('--publish')
  const only = args.find((a) => !a.startsWith('--'))
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config: await (await import('../src/payload.config')).default })
  const report: Record<string, string> = {}
  const admin = publish
    ? ((
        await payload.find({
          collection: 'users',
          where: { role: { equals: 'platformAdmin' } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
      ).docs[0] as unknown as Row | undefined)
    : undefined
  if (publish && !admin) throw new Error('--publish needs a platformAdmin user in this database')

  const apply = async (collection: 'departments' | 'programmes', slug: string, wanted: Row) => {
    const found = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: false,
      locale: 'en',
      overrideAccess: true,
    })
    const doc = found.docs[0] as unknown as (Row & { id: number | string }) | undefined
    if (!doc) {
      report[`${collection}/${slug}`] = 'no record'
      return
    }
    const add = missingSections(doc.pageContent as Row | undefined, wanted)
    const keys = Object.keys(add)
    if (keys.length === 0) {
      report[`${collection}/${slug}`] = 'already filled'
      return
    }
    await payload.update({
      collection,
      id: doc.id,
      data: { pageContent: { ...((doc.pageContent as Row) ?? {}), ...add } } as never,
      locale: 'en',
      draft: true,
      context: CONTEXT,
      overrideAccess: true,
    })
    if (admin) {
      // The workflow has no shortcut: in review, approved, then published.
      for (const governance of [{ status: 'in_review' }, { status: 'approved', verificationStatus: 'verified' }, {}]) {
        await payload.update({
          collection,
          id: doc.id,
          draft: governance.status !== undefined || undefined,
          data: (Object.keys(governance).length ? { governance } : { _status: 'published', governance: {} }) as never,
          locale: 'en',
          context: CONTEXT,
          user: { ...admin, collection: 'users' } as never,
          overrideAccess: false,
        })
      }
    }
    report[`${collection}/${slug}`] = `${admin ? 'published' : 'draft'}: filled ${keys.join(', ')}`
  }

  for (const p of departmentProfiles.filter((d) => !only || d.slug === only))
    await apply('departments', p.slug, departmentPageContent(p))
  for (const p of disciplineProfiles.filter((d) => !only || d.department === only))
    await apply('programmes', p.slug, programmePageContent(p))
  console.log(JSON.stringify(report, null, 1))
}

if (process.argv[1]?.endsWith('seed-page-content.ts')) {
  main().then(
    () => process.exit(0),
    (e) => {
      console.error(e instanceof Error ? e.message : e)
      process.exit(1)
    },
  )
}
