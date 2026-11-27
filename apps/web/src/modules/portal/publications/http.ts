/**
 * The one way the portal calls an outside service for publications (SEC-P06): fixed host names, no redirects, a timeout and a size
 * cap, JSON only. Called only from a server action that a signed-in person pressed, never from a page render (FF-07).
 */
export const ALLOWED_HOSTS = ['api.crossref.org', 'api.openalex.org'] as const
export const HTTP_LIMITS = { timeoutMs: 8000, bytes: 1_500_000 } as const

export type Fetcher = typeof fetch
export type HttpResult = { ok: true; json: unknown } | { ok: false; status: number | null }

export async function getJson(url: string, fetchImpl: Fetcher = fetch, timeoutMs: number = HTTP_LIMITS.timeoutMs): Promise<HttpResult> {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return { ok: false, status: null }
  }
  if (u.protocol !== 'https:' || !(ALLOWED_HOSTS as readonly string[]).includes(u.hostname) || u.username !== '' || u.port !== '') return { ok: false, status: null }
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetchImpl(u.toString(), { signal: ctl.signal, redirect: 'error', headers: { accept: 'application/json' } })
    if (!res.ok) return { ok: false, status: res.status }
    const declared = Number(res.headers?.get?.('content-length') ?? 0)
    if (declared > HTTP_LIMITS.bytes) return { ok: false, status: null }
    const text = await res.text()
    if (text.length > HTTP_LIMITS.bytes) return { ok: false, status: null }
    return { ok: true, json: JSON.parse(text) as unknown }
  } catch {
    return { ok: false, status: null }
  } finally {
    clearTimeout(timer)
  }
}
