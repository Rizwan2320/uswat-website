/* POST /api/portal/publish: the faculty portal sends a person's approved profile and Public works (ADR-0029).
   Every failure (no secret set, bad or old signature, bad body, unknown person) answers the same empty 404, so the address
   reveals nothing to anyone who cannot sign. The body is read once, bounded, and parsed through the allow-list. */
import configPromise from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'

import { parseMessage } from '@/modules/portal/bridge/contract'
import { verifyRequest } from '@/modules/portal/bridge/signing'
import { applyPortalMessage } from '@/modules/portal/bridge/receive'

export const dynamic = 'force-dynamic'
const MAX_BODY = 400_000
const notFound = () => new Response(null, { status: 404 })

export async function POST(req: Request) {
  const secret = process.env.PORTAL_BRIDGE_SECRET
  if (!secret) return notFound()
  const declared = Number(req.headers.get('content-length') ?? 0)
  if (declared > MAX_BODY) return notFound()
  const body = await req.text()
  if (body.length > MAX_BODY || !verifyRequest(secret, body, req.headers)) return notFound()
  let raw: unknown
  try {
    raw = JSON.parse(body)
  } catch {
    return notFound()
  }
  const msg = parseMessage(raw)
  if (!msg) return notFound()
  const payload = await getPayload({ config: configPromise })
  const result = await applyPortalMessage(payload, msg)
  if (!result.ok) return notFound()
  if (result.changed) {
    revalidateTag('list:people', 'max')
    revalidatePath(`/people/${result.slug}`)
  }
  return Response.json({ ok: true, changed: result.changed })
}
