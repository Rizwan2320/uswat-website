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

export async function applyAllSeeds(cms: Cms, actor: SeedActor, render: Render, now = Date.now()) {
  const organisation = await applySeeds(cms, actor)
  const contacts = await applyContactSeeds(cms, actor)
  const media = await applyMediaSeeds(cms, actor, render)
  const articles = await applyArticleSeeds(cms, actor, now, media.ids)
  const pages = await applyPageSeeds(cms, actor, now)
  return { ...organisation, contacts, media: { created: media.created, unchanged: media.unchanged }, articles, pages }
}
