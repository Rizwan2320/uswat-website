/**
 * Applies one verified message from the faculty portal to a People record (ADR-0029). Only the fields below are ever written;
 * name, designation, department, status, email address and photo are never touched. The write runs as the system actor through
 * the Local API with `portalApproved`, so the governance hooks, the audit log and Fact-check all apply as they do for any save.
 * A record that does not exist is never created: the answer is "no record".
 */
import type { Payload } from 'payload'

import type { BridgeMessage } from './contract'

export type ApplyResult = { ok: true; slug: string; changed: boolean; urduSkipped: boolean } | { ok: false; reason: 'no-record' | 'refused' }

type Doc = Record<string, unknown> & { id: number | string }

/** Fields the portal never writes: their live values travel unchanged with every write (see the note in applyPortalMessage). */
const KEEP = ['name', 'designation', 'department', 'office', 'email', 'photo', 'facultyStatus'] as const
const LOCALIZED_KEEP: readonly string[] = ['name', 'designation']

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
  type Row = { title?: string; url?: string; year?: number | null; venue?: string; workType?: string; featured?: boolean }
  const norm = (p: Row) => ({ title: p.title ?? '', url: p.url ?? '', year: p.year ?? null, venue: p.venue ?? '', workType: p.workType ?? 'other', featured: p.featured === true })
  const currentPubs = (Array.isArray(doc.publications) ? (doc.publications as Row[]) : []).map(norm)
  const wantPubs = msg.publications.map(norm)
  const data: Record<string, unknown> = {}
  let ur: string | null = null
  if (!same(currentPubs, wantPubs)) {
    data.publications = msg.publications.map((p) => ({ title: p.title, ...(p.url ? { url: p.url } : {}), ...(p.year !== null ? { year: p.year } : {}), venue: p.venue || null, workType: p.workType, featured: p.featured }))
  }

  if (msg.edit) {
    const current = (await payload.findByID({ collection: 'people', id: doc.id, locale: 'all', depth: 0, draft: false, overrideAccess: true })) as unknown as Doc
    const details = (current.details ?? {}) as { en?: string; ur?: string }
    if ((details.en ?? '') !== msg.edit.bio.en) data.details = msg.edit.bio.en
    if ((details.ur ?? '') !== msg.edit.bio.ur) ur = msg.edit.bio.ur
    if ((doc.cvLink ?? '') !== msg.edit.cvLink) data.cvLink = msg.edit.cvLink || null
    // Stage 2 fields: written only when the message carries them.
    const e = msg.edit
    if (e.researchInterests !== undefined) {
      const now = (Array.isArray(doc.researchInterests) ? (doc.researchInterests as { text?: string }[]) : []).map((r) => r.text ?? '')
      if (!same(now, e.researchInterests)) data.researchInterests = e.researchInterests.map((text) => ({ text }))
    }
    if (e.officeLocation !== undefined && ((doc.officeLocation as string | null) ?? '') !== e.officeLocation) data.officeLocation = e.officeLocation || null
    if (e.officeHours !== undefined && ((doc.officeHours as string | null) ?? '') !== e.officeHours) data.officeHours = e.officeHours || null
    if (e.orcid !== undefined && ((doc.orcid as string | null) ?? '') !== e.orcid) data.orcid = e.orcid || null
    if (e.scholarUrl !== undefined && ((doc.scholarUrl as string | null) ?? '') !== e.scholarUrl) data.scholarUrl = e.scholarUrl || null
    const vis = (doc.visibility ?? {}) as { email?: string; photo?: string }
    if (vis.email !== msg.edit.visibility.email || vis.photo !== msg.edit.visibility.photo) data.visibility = { email: msg.edit.visibility.email, photo: msg.edit.visibility.photo }
  }

  // Payload applies an update on top of the latest saved version, not on top of the live row. If the live row was ever changed
  // outside Payload (a SQL data fill on a preview database), a plain update would quietly put the older values back. Sending the
  // live values of the fields the portal does not own makes each write a no-op for them whatever the history. The two language
  // fields (name, designation) are carried only in the language they were read in.
  const keep = (locale: 'en' | 'ur') => {
    const out: Record<string, unknown> = {}
    for (const f of KEEP) if (doc[f] !== undefined && doc[f] !== null && (locale === 'en' || !LOCALIZED_KEEP.includes(f))) out[f] = doc[f]
    return out
  }
  const hasEnglish = Object.keys(data).length > 0
  try {
    if (hasEnglish) await write('en', { ...keep('en'), ...data })
  } catch {
    return { ok: false, reason: 'refused' }
  }
  // A save in Urdu needs the person's Urdu name (the People field is required in every language it is saved in). Without one the
  // Urdu text is left out and the rest still goes through; the Registrar's office adds the Urdu name.
  let urduSkipped = false
  if (ur !== null) {
    try {
      await write('ur', { ...keep('ur'), details: ur })
    } catch {
      urduSkipped = true
      ur = null
    }
  }
  return { ok: true, slug: msg.subject, changed: hasEnglish || ur !== null, urduSkipped }
}
