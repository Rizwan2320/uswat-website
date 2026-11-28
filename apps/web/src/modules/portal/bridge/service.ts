/**
 * Sends a person's approved profile and Public works to the public site (ADR-0029). It is safe to call often: an unchanged
 * message is not sent again unless `force` is set. A failure never undoes an approval; it is stored and shown as "waiting".
 */
import { createHash } from 'node:crypto'

import type { PublicationStore } from '../publications/types'
import { buildMessage } from './contract'
import type { BridgeStore } from './pgStore'
import { sendMessage, type BridgeConfig, type SendResult } from './sender'

export type SyncOutcome =
  | { status: 'sent' }
  | { status: 'unchanged' }
  | { status: 'off' }
  | { status: 'not-linked' }
  | { status: 'failed'; reason: Exclude<SendResult, { ok: true }>['reason'] }

export type BridgeDeps = {
  store: BridgeStore
  publications: Pick<PublicationStore, 'list'>
  config: BridgeConfig | null
  send?: typeof sendMessage
  now?: () => Date
}

const FAILURE_TEXT: Record<string, string> = { config: 'not set up', network: 'site not reachable', rejected: 'site refused it', server: 'site error' }

export async function syncPublicPage(deps: BridgeDeps, accountId: string, opts: { force?: boolean } = {}): Promise<SyncOutcome> {
  if (!deps.config) return { status: 'off' }
  const now = (deps.now ?? (() => new Date()))()
  const src = await deps.store.source(accountId)
  if (!src.recordRef) return { status: 'not-linked' }
  const lists = await deps.publications.list(accountId)
  const message = buildMessage(src.recordRef, src.edit, lists.claimed, src.approvedAt ?? new Date(0))
  if (!message) return { status: 'not-linked' }
  const hash = createHash('sha256').update(JSON.stringify(message)).digest('hex')
  const state = await deps.store.state(accountId)
  if (!opts.force && state?.lastOkAt && state.lastHash === hash) return { status: 'unchanged' }
  const result = await (deps.send ?? sendMessage)(deps.config, message)
  if (result.ok) {
    await deps.store.record(accountId, { ok: true, hash, at: now })
    return { status: 'sent' }
  }
  await deps.store.record(accountId, { ok: false, error: FAILURE_TEXT[result.reason] ?? 'failed', at: now })
  return { status: 'failed', reason: result.reason }
}
