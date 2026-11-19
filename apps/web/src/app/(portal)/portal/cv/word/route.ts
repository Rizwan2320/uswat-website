import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import { buildCv, isTemplate } from '@/modules/portal/cv/build'
import { currentTime, loadCvInput } from '@/modules/portal/cv/data'
import { cvWordHtml } from '@/modules/portal/cv/wordHtml'
import { strongAccount } from '@/modules/portal/server'

export const dynamic = 'force-dynamic'

const HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }

/** The CV as a file Word opens. This route is not covered by the page guard, so it re-checks the strong session itself. */
export async function GET(request: Request): Promise<Response> {
  const config = readPortalConfig(process.env)
  const account = config.enabled ? await strongAccount('/portal/cv/word') : null
  if (!config.enabled || !account) return new Response('Not signed in', { status: 401, headers: HEADERS })
  const template = new URL(request.url).searchParams.get('template') ?? 'university'
  if (!isTemplate(template)) return new Response('Unknown layout', { status: 400, headers: HEADERS })
  const cv = buildCv(await loadCvInput(getIdentityPool(config.databaseUrl), account), template, currentTime())
  return new Response(cvWordHtml(cv), {
    status: 200,
    headers: { ...HEADERS, 'Content-Type': 'application/msword; charset=utf-8', 'Content-Disposition': `attachment; filename="cv-${template}.doc"` },
  })
}
