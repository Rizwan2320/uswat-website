import { renderToStaticMarkup } from 'react-dom/server'

import CvDocument from './CvDocument'
import type { Cv } from './build'

/** Small inline style so Word keeps the structure; Word ignores most modern CSS, so this stays plain. */
const STYLE = `body{font-family:Georgia,serif;font-size:11pt;line-height:1.4}h1{font-size:20pt;margin:0 0 4pt}h2{font-size:14pt;border-bottom:1px solid #444;margin:14pt 0 4pt}table{border-collapse:collapse;width:100%}th,td{border:1px solid #888;padding:3pt 6pt;text-align:left;vertical-align:top}.cv-trust{font-size:9pt;color:#555;font-style:italic}.cv-sample{font-weight:bold;text-transform:uppercase}.cv-visually-hidden{display:none}.cv-pre{white-space:pre-wrap}`

/** The same React document as the page, as a complete HTML file that Word opens. React escapes all text. */
export function cvWordHtml(cv: Cv): string {
  const body = renderToStaticMarkup(<CvDocument cv={cv} />)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CV</title><style>${STYLE}</style></head><body>${body}</body></html>`
}
