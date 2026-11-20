/**
 * Four Sample static pages (brief p4-sample-media-pages) so the footer links and an editor's Pages screen have content.
 * They use the "none" hero (no image needed) and one content block. Every page says it is a Sample, and the legal ones
 * say they are not the university's policy.
 */
import type { Cms } from '../writer'
import { textToLexical } from '../writer'

import { SAMPLE_OWNER_OFFICE, sampleSource } from './data'
import type { SeedActor } from './apply'
import { emptyResult, loadBySource, seedRecord, type FlowResult } from './flow'
import { runPool, SEQUENTIAL, type Run } from './pool'

export type PageSeed = { slug: string; title: string; text: string }

const NOT_REAL = 'This is a Sample page. It is invented for testing and is not information about the university.'
export const pages: PageSeed[] = [
  { slug: 'about', title: 'Sample About page', text: `${NOT_REAL}\n\nA real About page would describe the university here, with a source for every fact.` },
  { slug: 'privacy', title: 'Sample Privacy page', text: `${NOT_REAL}\n\nThis is not the university's privacy policy. The real policy will be supplied by the university and checked before launch.` },
  { slug: 'terms', title: 'Sample Terms page', text: `${NOT_REAL}\n\nThese are not the university's terms of use. The real terms will be supplied by the university and checked before launch.` },
  { slug: 'accessibility', title: 'Sample Accessibility page', text: `${NOT_REAL}\n\nThis is not the university's accessibility statement. The real statement will be supplied by the university and checked before launch.` },
]

export async function applyPageSeeds(cms: Cms, actor: SeedActor, now = Date.now(), run: Run = SEQUENTIAL): Promise<FlowResult> {
  const out = emptyResult()
  const existing = await loadBySource(cms, 'pages')
  await runPool(pages, run, async (p) => {
    const source = sampleSource('pages', p.slug)
    await seedRecord(
      cms,
      actor,
      existing,
      {
        collection: 'pages',
        source,
        state: 'published',
        data: {
          title: p.title,
          slug: p.slug,
          publishedAt: new Date(now).toISOString(),
          hero: { type: 'none' },
          layout: [{ blockType: 'content', columns: [{ size: 'full', richText: textToLexical(p.text) }] }],
          governance: { ownerOffice: SAMPLE_OWNER_OFFICE, source },
        },
      },
      out,
    )
  })
  return out
}
