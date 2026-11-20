import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { pages } from '../../../../scripts/import/seeds/pages'
import { PDF_ADDRESS, PDF_NAME, PLACEHOLDER_H, PLACEHOLDER_W, placeholderImages, placeholderPdf, placeholderPng, placeholderSvg } from '../../../../scripts/import/seeds/placeholders'
import { renderPng } from '../../scripts/renderPng'

const dir = path.resolve(__dirname, '../../public/sample-media')

describe('placeholder generator', () => {
  it('makes a PNG of the stated size for each image, and a distinct one each time', async () => {
    const bufs = await Promise.all(placeholderImages.map((_, i) => placeholderPng(i, renderPng)))
    for (const b of bufs) {
      expect(b.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
      const m = await sharp(b).metadata()
      expect([m.width, m.height]).toEqual([PLACEHOLDER_W, PLACEHOLDER_H])
    }
    expect(new Set(bufs.map((b) => b.toString('base64'))).size).toBe(bufs.length)
  })
  it('draws no photograph or outside picture: the SVG has shapes and text only', () => {
    for (let i = 0; i < placeholderImages.length; i++) {
      const svg = placeholderSvg(i)
      expect(svg).not.toMatch(/<image|href=|data:|<script/i)
      expect(svg).toContain('SAMPLE')
    }
  })
  it('gives every image English and Urdu alt text, the Urdu marked as a draft', () => {
    for (const img of placeholderImages) {
      expect(img.alt).toMatch(/^Sample placeholder picture/)
      expect(img.alt).toMatch(/[؀-ۿ]/)
      expect(img.alt).toContain('مسودہ')
    }
  })
  it('writes a valid one-page PDF whose cross-reference table points at the right places', () => {
    const pdf = placeholderPdf().toString('latin1')
    expect(pdf.startsWith('%PDF-1.4')).toBe(true)
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true)
    const startxref = Number(/startxref\n(\d+)/.exec(pdf)![1])
    expect(pdf.slice(startxref, startxref + 4)).toBe('xref')
    const offsets = [...pdf.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]))
    offsets.forEach((o, i) => expect(pdf.slice(o, o + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`))
    expect(pdf).toContain('/Count 1')
  })
})

describe('committed placeholder files', () => {
  it('exist, are small, and are the right kind of file', async () => {
    for (const img of placeholderImages) {
      const buf = await readFile(path.join(dir, img.name))
      expect(buf.length, img.name).toBeLessThan(100_000)
      const m = await sharp(buf).metadata()
      expect([m.format, m.width, m.height], img.name).toEqual(['png', PLACEHOLDER_W, PLACEHOLDER_H])
    }
    const pdf = await readFile(path.join(dir, PDF_NAME))
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
    expect((await stat(path.join(dir, PDF_NAME))).size).toBeLessThan(10_000)
    expect(PDF_ADDRESS).toBe(`/sample-media/${PDF_NAME}`)
  })
})

describe('Sample static pages', () => {
  it('say they are Sample, and the legal ones say they are not the university policy', () => {
    expect(pages.map((p) => p.slug)).toEqual(['about', 'privacy', 'terms', 'accessibility'])
    for (const p of pages) {
      expect(p.title.startsWith('Sample')).toBe(true)
      expect(p.text).toContain('This is a Sample page')
    }
    for (const slug of ['privacy', 'terms', 'accessibility']) expect(pages.find((p) => p.slug === slug)!.text).toMatch(/not the university's/)
  })
})
