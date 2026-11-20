/**
 * Every Sample seed in one call, in the order that keeps links valid: organisation data (drafts linked, then published),
 * contacts, media, then articles (which may point at media), then pages. Idempotent: a second run creates nothing.
 */
import type { Cms } from '../writer'

import { applySeeds, type SeedActor } from './apply'
import { applyArticleSeeds } from './articles'
import { applyContactSeeds } from './contacts'
import { applyMediaSeeds } from './media'
import { applyPageSeeds } from './pages'
import type { Render } from './placeholders'
import { SEQUENTIAL, type Run } from './pool'

/**
 * `run` sets how many records are written at once and an optional deadline (prediction A4-q). The default is the old
 * sequential, no-deadline behaviour. `partial` is true when the deadline cut the run short: run it again to finish.
 */
export async function applyAllSeeds(cms: Cms, actor: SeedActor, render: Render, now = Date.now(), run: Run = SEQUENTIAL) {
  const organisation = await applySeeds(cms, actor, run)
  const contacts = await applyContactSeeds(cms, actor, run)
  const media = await applyMediaSeeds(cms, actor, render)
  const articles = await applyArticleSeeds(cms, actor, now, media.ids, run)
  const pages = await applyPageSeeds(cms, actor, now, run)
  return { ...organisation, contacts, media: { created: media.created, unchanged: media.unchanged }, articles, pages, partial: run.stopped === true }
}
