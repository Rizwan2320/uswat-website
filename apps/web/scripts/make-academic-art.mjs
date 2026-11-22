/**
 * Draws the illustrations for the department and discipline pages (plain SVG, no dependencies).
 * Original artwork in the site's brand colours: no people, no logos, no photographs.
 *
 *   node scripts/make-academic-art.mjs        writes apps/web/public/images/academics/*.svg
 *
 * Output is deterministic (a seeded random generator), so running it again changes nothing unless this file
 * changes. A unit test checks that every picture a profile names exists.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const OUT = path.resolve(process.cwd(), 'public/images/academics')
mkdirSync(OUT, { recursive: true })

const DARK = { bg: ['#002a10', '#003b17', '#0b5a27'], ink: '#fcfaf4', soft: 'rgba(252,250,244,0.22)', faint: 'rgba(252,250,244,0.1)', accent: '#f2b705', accent2: '#ffd84d', dots: 'rgba(242,183,5,0.16)', glow: 'rgba(242,183,5,0.28)', panel: 'rgba(252,250,244,0.08)' }
const LIGHT = { bg: ['#fcfaf4', '#f3efe3', '#ebe5d2'], ink: '#003b17', soft: 'rgba(0,59,23,0.25)', faint: 'rgba(0,59,23,0.1)', accent: '#7a1f26', accent2: '#f2b705', dots: 'rgba(0,59,23,0.1)', glow: 'rgba(242,183,5,0.3)', panel: 'rgba(0,59,23,0.06)' }

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const f = (n) => Math.round(n * 10) / 10
const circle = (x, y, r, fill, extra = '') => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fill}" ${extra}/>`
const line = (x1, y1, x2, y2, stroke, w = 2, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`
const rect = (x, y, w, h, fill, r = 10, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fill}" ${extra}/>`

/* ---- motifs: each is drawn in a 1000 x 600 box ---- */

function treeAndCode(p, r) {
  const out = []
  const levels = [1, 2, 4, 8]
  const pos = []
  levels.forEach((n, d) => {
    const y = 90 + d * 105
    const span = 520
    for (let i = 0; i < n; i++) pos.push({ d, i, x: 50 + (span / n) * (i + 0.5), y })
  })
  for (const a of pos) {
    if (a.d === 3) continue
    for (const k of [0, 1]) {
      const c = pos.find((q) => q.d === a.d + 1 && q.i === a.i * 2 + k)
      out.push(line(a.x, a.y, c.x, c.y, p.soft, 2.5))
    }
  }
  for (const a of pos) out.push(circle(a.x, a.y, a.d === 0 ? 20 : 14, r() > 0.78 || a.d === 0 ? p.accent : p.ink, a.d === 3 ? 'opacity="0.85"' : ''))
  // editor window
  out.push(rect(610, 150, 340, 330, p.panel, 18, `stroke="${p.soft}" stroke-width="2"`))
  out.push(circle(640, 178, 6, p.accent), circle(662, 178, 6, p.soft), circle(684, 178, 6, p.soft))
  let y = 215
  const widths = [150, 220, 110, 180, 90, 240, 130, 170, 60, 200]
  widths.forEach((w, i) => {
    const indent = [0, 28, 28, 56, 28, 28, 56, 28, 0, 0][i]
    out.push(rect(640 + indent, y, w, 12, i % 3 === 0 ? p.accent : p.soft, 6))
    y += 25
  })
  out.push(`<text x="610" y="560" font-family="Consolas, Menlo, monospace" font-size="64" font-weight="700" fill="${p.accent}">{ }</text>`)
  out.push(`<text x="740" y="560" font-family="Consolas, Menlo, monospace" font-size="64" font-weight="700" fill="${p.ink}" opacity="0.7">&lt;/&gt;</text>`)
  return out.join('')
}

function layersAndBranches(p) {
  const out = []
  const cx = 650
  const dia = (y, fill, op) => `<polygon points="${cx},${y} ${cx + 230},${y + 115} ${cx},${y + 230} ${cx - 230},${y + 115}" fill="${fill}" fill-opacity="${op}" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="2" stroke-linejoin="round"/>`
  out.push(dia(330, p.ink, 0.1), dia(250, p.ink, 0.18), dia(170, p.accent, 0.95))
  out.push(circle(cx, 285, 10, p.bg[0]), circle(cx - 90, 340, 7, p.bg[0]), circle(cx + 90, 340, 7, p.bg[0]))
  out.push(line(cx - 90, 340, cx, 285, p.bg[0], 3), line(cx + 90, 340, cx, 285, p.bg[0], 3))
  // git-like history
  out.push(line(110, 80, 110, 540, p.soft, 4))
  const main = [110, 200, 290, 380, 470]
  main.forEach((y) => out.push(circle(110, y, 13, p.ink)))
  out.push(`<path d="M110 200 C 110 150, 220 170, 220 230 L 220 330 C 220 390, 110 380, 110 380" fill="none" stroke="${p.accent}" stroke-width="5" stroke-linecap="round"/>`)
  out.push(circle(220, 250, 12, p.accent), circle(220, 320, 12, p.accent))
  ;[...Array(5)].forEach((_, i) => out.push(rect(255, 150 + i * 70, 90 + (i % 3) * 30, 12, i % 2 ? p.soft : p.faint, 6)))
  return out.join('')
}

function network(p, r) {
  const out = []
  const cx = 500
  const cy = 300
  const nodes = []
  for (let i = 0; i < 9; i++) {
    const ang = (Math.PI * 2 * i) / 9 - Math.PI / 2
    const rad = i % 2 ? 190 : 245
    nodes.push({ x: cx + Math.cos(ang) * rad * 1.45, y: cy + Math.sin(ang) * rad })
  }
  out.push(`<ellipse cx="${cx}" cy="${cy}" rx="330" ry="215" fill="none" stroke="${p.soft}" stroke-width="2" stroke-dasharray="4 10"/>`)
  nodes.forEach((n, i) => {
    out.push(line(cx, cy, n.x, n.y, p.soft, 2.5))
    const next = nodes[(i + 1) % nodes.length]
    out.push(line(n.x, n.y, next.x, next.y, p.faint, 2))
  })
  nodes.forEach((n, i) => {
    out.push(rect(n.x - 34, n.y - 24, 68, 48, p.panel, 10, `stroke="${p.ink}" stroke-opacity="0.55" stroke-width="2"`))
    out.push(circle(n.x - 16, n.y - 7, 4, i % 3 === 0 ? p.accent : p.ink), circle(n.x - 16, n.y + 8, 4, p.soft))
    out.push(rect(n.x - 2, n.y - 10, 26, 6, p.soft, 3), rect(n.x - 2, n.y + 5, 18, 6, p.soft, 3))
  })
  out.push(circle(cx, cy, 62, p.glow), circle(cx, cy, 44, p.accent), circle(cx, cy, 20, p.bg[0]))
  void r
  return out.join('')
}

function charts(p, r) {
  const out = []
  out.push(rect(60, 70, 560, 400, p.panel, 20, `stroke="${p.soft}" stroke-width="2"`))
  for (let i = 0; i < 5; i++) out.push(line(100, 130 + i * 70, 580, 130 + i * 70, p.faint, 2))
  const heights = [120, 190, 150, 250, 210, 290, 240]
  const pts = []
  heights.forEach((h, i) => {
    const x = 120 + i * 66
    out.push(rect(x, 420 - h, 40, h, i === 5 ? p.accent : p.ink, 8, i === 5 ? '' : 'opacity="0.55"'))
    pts.push([x + 20, 420 - h - 28 - r() * 30])
  })
  out.push(`<polyline points="${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}" fill="none" stroke="${p.accent2}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`)
  pts.forEach(([x, y]) => out.push(circle(x, y, 7, p.bg[0], `stroke="${p.accent2}" stroke-width="4"`)))
  // scatter
  out.push(rect(650, 70, 290, 230, p.panel, 20, `stroke="${p.soft}" stroke-width="2"`))
  for (let i = 0; i < 34; i++) {
    const t = i / 33
    const x = 680 + t * 230 + (r() - 0.5) * 50
    const y = 260 - t * 150 + (r() - 0.5) * 70
    out.push(circle(x, y, 5 + r() * 3, i % 7 === 0 ? p.accent : p.ink, 'opacity="0.7"'))
  }
  // donut
  const R = 78
  const C = 2 * Math.PI * R
  out.push(circle(745, 410, R, 'none', `stroke="${p.soft}" stroke-width="30"`))
  out.push(circle(745, 410, R, 'none', `stroke="${p.accent}" stroke-width="30" stroke-dasharray="${f(C * 0.62)} ${f(C)}" transform="rotate(-90 745 410)"`))
  out.push(circle(745, 410, R, 'none', `stroke="${p.ink}" stroke-opacity="0.7" stroke-width="30" stroke-dasharray="${f(C * 0.2)} ${f(C)}" stroke-dashoffset="${f(-C * 0.64)}" transform="rotate(-90 745 410)"`))
  out.push(rect(880, 380, 60, 12, p.soft, 6), rect(880, 410, 40, 12, p.faint, 6), rect(880, 440, 52, 12, p.soft, 6))
  return out.join('')
}

function neural(p) {
  const out = []
  const layers = [3, 5, 5, 4, 2]
  const xs = [130, 330, 530, 730, 900]
  const nodes = layers.map((n, li) => Array.from({ length: n }, (_, i) => ({ x: xs[li], y: 300 + (i - (n - 1) / 2) * 92 })))
  for (let l = 0; l < nodes.length - 1; l++) for (const a of nodes[l]) for (const b of nodes[l + 1]) out.push(line(a.x, a.y, b.x, b.y, p.faint, 2))
  const path = [nodes[0][1], nodes[1][2], nodes[2][1], nodes[3][2], nodes[4][0]]
  out.push(`<polyline points="${path.map((n) => `${n.x},${n.y}`).join(' ')}" fill="none" stroke="${p.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`)
  nodes.forEach((layer, li) =>
    layer.forEach((n) => {
      const hot = path.includes(n)
      out.push(circle(n.x, n.y, hot ? 24 : 19, hot ? p.accent : p.bg[0], `stroke="${p.ink}" stroke-opacity="${hot ? 0.9 : 0.6}" stroke-width="3"`))
      if (!hot) out.push(circle(n.x, n.y, 6, p.ink, 'opacity="0.6"'))
      void li
    }),
  )
  return out.join('')
}

function chip(p, r, label = 'DCST') {
  const out = []
  const x0 = 330
  const y0 = 170
  const w = 340
  const h = 260
  // traces
  const trace = (x1, y1, pts, end) => {
    out.push(`<polyline points="${[[x1, y1], ...pts].map(([x, y]) => `${x},${y}`).join(' ')}" fill="none" stroke="${p.soft}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`)
    out.push(circle(end[0], end[1], 8, p.bg[0], `stroke="${p.accent}" stroke-width="3"`))
  }
  for (let i = 0; i < 5; i++) {
    const y = y0 + 40 + i * 45
    const off = 90 + r() * 80
    trace(x0, y, [[x0 - off * 0.5, y], [x0 - off * 0.5 - 40, y + (i % 2 ? 40 : -40)], [x0 - off - 90, y + (i % 2 ? 40 : -40)]], [x0 - off - 90, y + (i % 2 ? 40 : -40)])
    const off2 = 90 + r() * 80
    trace(x0 + w, y, [[x0 + w + off2 * 0.5, y], [x0 + w + off2 * 0.5 + 40, y + (i % 2 ? -40 : 40)], [x0 + w + off2 + 90, y + (i % 2 ? -40 : 40)]], [x0 + w + off2 + 90, y + (i % 2 ? -40 : 40)])
  }
  for (let i = 0; i < 5; i++) {
    const x = x0 + 50 + i * 60
    trace(x, y0, [[x, y0 - 50], [x + (i % 2 ? 30 : -30), y0 - 80]], [x + (i % 2 ? 30 : -30), y0 - 80])
    trace(x, y0 + h, [[x, y0 + h + 50], [x + (i % 2 ? -30 : 30), y0 + h + 80]], [x + (i % 2 ? -30 : 30), y0 + h + 80])
  }
  out.push(rect(x0, y0, w, h, p.bg[1], 24, `stroke="${p.ink}" stroke-opacity="0.7" stroke-width="4"`))
  out.push(rect(x0 + 18, y0 + 18, w - 36, h - 36, 'none', 14, `stroke="${p.accent}" stroke-width="2" stroke-dasharray="3 8"`))
  out.push(`<text x="${x0 + w / 2}" y="${y0 + h / 2 + 30}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${label.length > 4 ? 66 : 92}" font-weight="700" fill="${p.accent}">${label}</text>`)
  return out.join('')
}

const MOTIFS = { cs: treeAndCode, se: layersAndBranches, it: network, ds: charts, ai: neural, dcst: chip }

/* Hero pictures for the Research and Administration pages (src/site/offices): the same chip with the office's short name.
   Keys are the office slugs; they are written to public/images/offices/<slug>-hero.svg. */
const OFFICES = {
  research: 'Research',
  administration: 'Admin',
  'oric-2': 'ORIC',
  'advanced-studies-and-research-board': 'DASR',
  'directorate-of-it': 'IT',
  'controller-of-examination-office': 'CoE',
  'directorate-of-works': 'Works',
  'proctorial-board': 'Proctor',
  'kamyab-jawan-markaz': 'YDC',
  alumni: 'Alumni',
  'hunerkada-center-for-excellence': 'Hunerkada',
  about: 'About',
  'vice-chancellors-message': 'VC',
}
for (const [k, label] of Object.entries(OFFICES)) MOTIFS[k] = (p, r) => chip(p, r, label)

/* ---- canvas ---- */
function canvas(W, H, p, motifKey, seed, uid) {
  const r = rng(seed)
  const wide = W / H > 1.6
  const scale = wide ? (H / 600) * 0.92 : Math.min(W / 1000, H / 600) * 0.94
  const tx = wide ? W - 1000 * scale - W * 0.06 : (W - 1000 * scale) / 2
  const ty = (H - 600 * scale) / 2
  const glowX = tx + 500 * scale
  const motif = MOTIFS[motifKey](p, rng(seed + 7))
  void r
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="bg${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg[0]}"/><stop offset="0.55" stop-color="${p.bg[1]}"/><stop offset="1" stop-color="${p.bg[2]}"/></linearGradient>
<radialGradient id="gl${uid}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${p.glow}"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
<pattern id="dt${uid}" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="${p.dots}"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg${uid})"/>
<rect width="${W}" height="${H}" fill="url(#dt${uid})"/>
<ellipse cx="${f(glowX)}" cy="${f(H / 2)}" rx="${f(520 * scale)}" ry="${f(380 * scale)}" fill="url(#gl${uid})"/>
<g transform="translate(${f(tx)} ${f(ty)}) scale(${f(scale * 1000) / 1000})">${motif}</g>
</svg>
`
}

const FILES = []
const keys = ['dcst', 'cs', 'se', 'it', 'ds', 'ai']
keys.forEach((k, i) => {
  FILES.push([`${k}-hero.svg`, canvas(1600, 640, DARK, k, 100 + i, `h${i}`)])
  FILES.push([`${k}-tile.svg`, canvas(900, 600, DARK, k, 200 + i, `t${i}`)])
  FILES.push([`${k}-lab.svg`, canvas(900, 600, LIGHT, k, 300 + i, `l${i}`)])
})
for (const [name, svg] of FILES) writeFileSync(path.join(OUT, name), svg)
const OFFICE_OUT = path.resolve(process.cwd(), 'public/images/offices')
mkdirSync(OFFICE_OUT, { recursive: true })
Object.keys(OFFICES).forEach((k, i) => {
  writeFileSync(path.join(OFFICE_OUT, `${k}-hero.svg`), canvas(1600, 640, DARK, k, 400 + i, `o${i}`))
})
console.log(`wrote ${FILES.length} files to ${OUT}`)
