/**
 * Request-level step that answers old university addresses (MIG-02, ADR-0012).
 *
 * A mapped address gets a real 301 to its new path, or a 410 where the old page is gone, before any
 * page renders. Trailing slashes are handled here too (next.config sets skipTrailingSlashRedirect),
 * so an old address ending in "/" is one hop, not two. Everything else passes through untouched.
 */
import { NextResponse, type NextRequest } from 'next/server'

import { resolveLegacy, type LegacyRules } from '@/legacy/routeMap'
import rules from '@/legacy/routeMap.generated.json'

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hit = resolveLegacy(pathname, rules as LegacyRules)
  if (!hit) return NextResponse.next()

  if (hit.kind === 'gone') {
    return new NextResponse('This page is no longer available.\n', {
      status: 410,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
        'x-robots-tag': 'noindex',
      },
    })
  }

  const target = new URL(hit.to + (hit.kind === 'redirect' ? '' : search), request.url)
  // 308 keeps the method for the framework's own slash redirect; 301 is the permanent move the plan names.
  const response = NextResponse.redirect(target, hit.kind === 'redirect' ? 301 : 308)
  if (hit.kind === 'redirect') response.headers.set('cache-control', 'public, max-age=3600')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
