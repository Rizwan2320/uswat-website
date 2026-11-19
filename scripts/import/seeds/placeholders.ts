/**
 * Generated placeholder files for the Sample pack (brief p4-sample-media-pages): flat shapes and the word SAMPLE, no
 * photographs, no people, no logos. Three images (PNG, 1200 x 630) and one one-page PDF. The caller supplies the
 * SVG-to-PNG step (`sharp`, already a Payload dependency, lives in apps/web), and the PDF is written by hand, so
 * nothing is added.
 */
export const PLACEHOLDER_W = 1200
export const PLACEHOLDER_H = 630
export const STATIC_DIR = '/sample-media'
export const PDF_NAME = 'sample-document.pdf'
export const PDF_ADDRESS = `${STATIC_DIR}/${PDF_NAME}`

export type PlaceholderImage = {
  name: string
  /** English text first, then a draft Urdu line (ADR 0008). The Media `alt` field is one text field. */
  alt: string
}

const URDU_DRAFT = 'نمونہ تصویر (مسودہ ترجمہ)'
export const placeholderImages: PlaceholderImage[] = [
  { name: 'sample-placeholder-1.png', alt: `Sample placeholder picture: pale green shapes and the word SAMPLE. ${URDU_DRAFT}` },
  { name: 'sample-placeholder-2.png', alt: `Sample placeholder picture: grey and gold shapes and the word SAMPLE. ${URDU_DRAFT}` },
  { name: 'sample-placeholder-3.png', alt: `Sample placeholder picture: dark green shapes and the word SAMPLE. ${URDU_DRAFT}` },
]

const PALETTES = [
  { bg: '#e6efe3', a: '#b9d1b2', b: '#8fb386', ink: '#2f5a2b' },
  { bg: '#ecebe6', a: '#cfcdc4', b: '#e2c34d', ink: '#4a483f' },
  { bg: '#1f4a2a', a: '#2f6a3d', b: '#4f8f5e', ink: '#f4f1e4' },
]

export function placeholderSvg(index: number): string {
  const p = PALETTES[index % PALETTES.length]
  const shift = index * 90
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PLACEHOLDER_W}" height="${PLACEHOLDER_H}" viewBox="0 0 ${PLACEHOLDER_W} ${PLACEHOLDER_H}">
<rect width="${PLACEHOLDER_W}" height="${PLACEHOLDER_H}" fill="${p.bg}"/>
<polygon points="0,${420 - shift / 3} ${PLACEHOLDER_W},${180 + shift / 3} ${PLACEHOLDER_W},${PLACEHOLDER_H} 0,${PLACEHOLDER_H}" fill="${p.a}"/>
<circle cx="${220 + shift * 2}" cy="170" r="110" fill="${p.b}"/>
<rect x="${760 - shift}" y="360" width="300" height="170" rx="18" fill="${p.b}" opacity="0.85"/>
<text x="${PLACEHOLDER_W / 2}" y="${PLACEHOLDER_H / 2 + 38}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="120" letter-spacing="14" fill="${p.ink}">SAMPLE</text>
<text x="${PLACEHOLDER_W / 2}" y="${PLACEHOLDER_H / 2 + 98}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" fill="${p.ink}">Placeholder image</text>
</svg>`
}

/** Turns SVG text into PNG bytes. */
export type Render = (svg: string) => Promise<Buffer>

export const placeholderPng = (index: number, render: Render): Promise<Buffer> => render(placeholderSvg(index))

/** A valid one-page PDF with a single line of text (Helvetica, a base font every reader has). */
export function placeholderPdf(): Buffer {
  const text = 'SAMPLE placeholder document. Invented for testing; not a university document.'
  const stream = `BT /F1 18 Tf 60 740 Td (${text}) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let out = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((o, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out, 'latin1')
}
