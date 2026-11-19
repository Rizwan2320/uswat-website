import sharp from 'sharp'

import type { Render } from '../../../scripts/import/seeds/placeholders'

/** SVG text to PNG bytes with sharp (a Payload dependency). Used by the placeholder seeds. */
export const renderPng: Render = (svg) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
