/**
 * Server-side entry for portal pages: runs the page guard and turns its answer into a render,
 * a redirect or a 404. Every page calls this first.
 */
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import type { FactorState } from '../identity/gate'
import { portalDeps } from './deps'
import { accountFrom, guardPage, reviewerFrom } from './pageGuard'

export async function requirePortalPage(pathname: string): Promise<{ userId: string | null; email: string | null; strong: boolean; factors: FactorState | null; fresh: boolean }> {
  const result = await guardPage({ env: process.env, ...portalDeps }, await headers(), pathname, Date.now())
  if (result.action === 'notFound') notFound()
  if (result.action === 'redirect') redirect(result.to)
  return { userId: result.userId, email: result.email, strong: result.strong, factors: result.factors, fresh: result.fresh }
}

/**
 * For server actions: the signed-in account, or null. Re-checks the whole page guard (session, lifetime, second factor)
 * so an action never trusts that the page was rendered for the caller. Never redirects; the caller answers with an error.
 * The account id comes only from the session, never from the request (FPR-03).
 */
export async function strongAccount(pathname: string): Promise<{ id: string; email: string } | null> {
  const result = await guardPage({ env: process.env, ...portalDeps }, await headers(), pathname, Date.now())
  return accountFrom(result)
}

/** For reviewer actions: the signed-in account's id and whether its second factor is fresh. Same guard, same rules as `strongAccount`. */
export async function strongReviewer(pathname: string): Promise<{ id: string; fresh: boolean } | null> {
  return reviewerFrom(await guardPage({ env: process.env, ...portalDeps }, await headers(), pathname, Date.now()))
}
