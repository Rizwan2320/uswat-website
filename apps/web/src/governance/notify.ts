/**
 * Reviewer notifications (LIF-03) behind a small adapter. The demo adapter writes a log line;
 * an email or webhook adapter can replace it with `setNotifier` without touching the hooks.
 */

import type { CollectionAfterChangeHook } from 'payload'

export interface ReviewNotification {
  event: 'new_draft'
  collection: string
  id: string | number
  origin: 'importer' | 'watcher'
  ownerOffice: string | null
}

export interface Notifier {
  send(
    notification: ReviewNotification,
    ctx: { logger: { info: (msg: string) => void } },
  ): void | Promise<void>
}

/** Demo adapter: one log line per notification. */
export const consoleNotifier: Notifier = {
  send(n, { logger }) {
    logger.info(
      `[review-queue] new ${n.origin} draft in ${n.collection} #${n.id}` +
        (n.ownerOffice ? ` for ${n.ownerOffice}` : ''),
    )
  },
}

let current: Notifier = consoleNotifier
export const setNotifier = (n: Notifier): void => {
  current = n
}
export const resetNotifier = (): void => {
  current = consoleNotifier
}

/** After a record is created by the importer or the watcher, tell reviewers once. */
export const notifyNewDraft: CollectionAfterChangeHook = async ({
  doc,
  operation,
  collection,
  req,
}) => {
  if (operation !== 'create') return doc
  const gov = (doc?.governance ?? {}) as {
    origin?: string
    status?: string
    ownerOffice?: string | null
  }
  if (
    (gov.origin === 'importer' || gov.origin === 'watcher') &&
    (gov.status ?? 'draft') === 'draft'
  ) {
    await current.send(
      {
        event: 'new_draft',
        collection: collection.slug,
        id: doc.id,
        origin: gov.origin,
        ownerOffice: gov.ownerOffice ?? null,
      },
      { logger: req.payload.logger },
    )
  }
  return doc
}
