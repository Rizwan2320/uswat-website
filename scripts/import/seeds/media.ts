/**
 * Sample Media rows from the generated placeholder images (brief p4-sample-media-pages). Media is not governed, so the
 * Sample marker is `sourceUrl` on sample.invalid (and the credit line). Found by that address, so a second run writes
 * nothing. Alt text is one field: English first, then a draft Urdu line.
 */
import type { Cms } from '../writer'

import { sampleSource } from './data'
import type { SeedActor } from './apply'
import { placeholderImages, placeholderPng, type Render } from './placeholders'

export type MediaResult = { created: number; unchanged: number; ids: Map<string, number | string> }

export async function applyMediaSeeds(cms: Cms, actor: SeedActor, render: Render): Promise<MediaResult> {
  const out: MediaResult = { created: 0, unchanged: 0, ids: new Map() }
  const found = await cms.find({
    collection: 'media',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    where: { sourceUrl: { like: 'https://sample.invalid/seed/media/' } },
  })
  const bySource = new Map(found.docs.map((d) => [String(d.sourceUrl), d.id as number | string]))
  for (const [i, img] of placeholderImages.entries()) {
    const source = sampleSource('media', img.name)
    const existing = bySource.get(source)
    if (existing !== undefined) {
      out.unchanged++
      out.ids.set(img.name, existing)
      continue
    }
    const data = await placeholderPng(i, render)
    const doc = await cms.create({
      collection: 'media',
      data: { alt: img.alt, credit: 'Sample placeholder (generated)', rightsStatus: 'owned', sourceUrl: source },
      file: { data, mimetype: 'image/png', name: img.name, size: data.length },
      user: actor.user,
      overrideAccess: false,
      context: { disableRevalidate: true },
    })
    out.created++
    out.ids.set(img.name, doc.id)
  }
  return out
}
