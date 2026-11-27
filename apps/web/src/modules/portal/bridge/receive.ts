/**
 * Applies one verified message from the faculty portal to a People record (ADR-0029). Only the fields below are ever written;
 * name, designation, department, status, email address and photo are never touched. The write runs as the system actor through
 * the Local API with `portalApproved`, so the governance hooks, the audit log and Fact-check all apply as they do for any save.
 * A record that does not exist is never created: the answer is "no record".
 */
import type { Payload } from 'payload'

import type { BridgeMessage } from './contract'

export type ApplyResult = { ok: true; slug: string; changed: boolean } | { ok: false; reason: 'no-record' | 'refused' }

type Doc = Record<string, unknown> & { id: number | string }

export async function applyPortalMessage(payload: Payload, msg: BridgeMessage): Promise<ApplyResult> {
  const found = await payload.find({
    collection: 'people',
    where: { slug: { equals: msg.subject } },
    limit: 1,
    pagination: false,
    draft: false,
    depth: 0,
    overrideAccess: true,
  })
  const doc = found.docs[0] as unknown as Doc | undefined
  if (!doc) return { ok: false, reason: 'no-record' }

  const write = async (locale: 'en' | 'ur', data: Record<string, unknown>) =>
    payload.update({
      collection: 'people',
      id: doc.id,
      locale,
      data,
      draft: false,
      depth: 0,
      overrideAccess: true,
      context: { portalApproved: true },
    })

  const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
  const currentPubs = (Array.isArray(doc.publications) ? doc.publications : []).map((p) => ({ title: (p as { title?: string }).title ?? '', url: (p as { url?: string }).url ?? '' }))
  const wantPubs = msg.publications.map((p) => ({ title: p.title, url: p.url }))
  const data: Record<string, unknown> = {}
  if (!same(currentPubs, wantPubs)) data.publications = msg.publications.map((p) => (p.url ? { title: p.title, url: p.url } : { title: p.title }))

  let ur: string | null = null
  if (msg.edit) {
    const current = (await payload.findByID({ collection: 'people', id: doc.id, locale: 'all', depth: 0, draft: false, overrideAccess: true })) as unknown as Doc
    const details = (current.details ?? {}) as { en?: string; ur?: string }
    if ((details.en ?? '') !== msg.edit.bio.en) data.details = msg.edit.bio.en
    if ((details.ur ?? '') !== msg.edit.bio.ur) ur = msg.edit.bio.ur
    if ((doc.cvLink ?? '') !== msg.edit.cvLink) data.cvLink = msg.edit.cvLink || null
    const vis = (doc.visibility ?? {}) as { email?: string; photo?: string }
    if (vis.email !== msg.edit.visibility.email || vis.photo !== msg.edit.visibility.photo) data.visibility = { email: msg.edit.visibility.email, photo: msg.edit.visibility.photo }
  }

  try {
    if (Object.keys(data).length) await write('en', data)
    if (ur !== null) await write('ur', { details: ur })
  } catch {
    return { ok: false, reason: 'refused' }
  }
  return { ok: true, slug: msg.subject, changed: Object.keys(data).length > 0 || ur !== null }
}
