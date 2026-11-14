/**
 * Server-side entry for portal pages: runs the page guard and turns its answer into a render,
 * a redirect or a 404. Every page calls this first.
 */
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import type { FactorState } from '../identity/gate'
import { portalDeps } from './deps'
import { guardPage } from './pageGuard'

export async function requirePortalPage(pathname: string): Promise<{ email: string | null; strong: boolean; factors: FactorState | null; fresh: boolean }> {
  const result = await guardPage({ env: process.env, ...portalDeps }, await headers(), pathname, Date.now())
  if (result.action === 'notFound') notFound()
  if (result.action === 'redirect') redirect(result.to)
  return { email: result.email, strong: result.strong, factors: result.factors, fresh: result.fresh }
}
