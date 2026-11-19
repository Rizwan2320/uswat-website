/**
 * Writes the generated placeholder files to `public/sample-media/` (the folder that is committed). Run it again only
 * if the generator changes; a unit test fails if the committed files drift from what the generator makes.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { renderPng } from './renderPng'
import { PDF_NAME, placeholderImages, placeholderPdf, placeholderPng } from '../../../scripts/import/seeds/placeholders'

const dir = path.resolve(process.cwd(), 'public/sample-media')
await mkdir(dir, { recursive: true })
for (const [i, img] of placeholderImages.entries()) await writeFile(path.join(dir, img.name), await placeholderPng(i, renderPng))
await writeFile(path.join(dir, PDF_NAME), placeholderPdf())
console.log(`wrote ${placeholderImages.length + 1} files to ${dir}`)
