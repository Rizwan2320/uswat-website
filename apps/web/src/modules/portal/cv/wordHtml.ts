import { COPY } from '../copy'
import type { Cv, Trust } from './build'

/*
 * The Word file is the same CV as the page, written as a plain string.
 * Next.js does not allow react-dom/server in a route handler, so this cannot reuse CvDocument.tsx;
 * a unit test checks that both carry exactly the same visible text, so they cannot drift apart.
 * Every value goes through esc(); nothing from a record is ever written into markup unescaped.
 */
const C = COPY.cv

/** Small inline style so Word keeps the structure; Word ignores most modern CSS, so this stays plain. */
const STYLE = `body{font-family:Georgia,serif;font-size:11pt;line-height:1.4}h1{font-size:20pt;margin:0 0 4pt}h2{font-size:14pt;border-bottom:1px solid black;margin:14pt 0 4pt}table{border-collapse:collapse;width:100%}th,td{border:1px solid gray;padding:3pt 6pt;text-align:left;vertical-align:top}.cv-trust{font-size:9pt;color:dimgray;font-style:italic}.cv-sample{font-weight:bold;text-transform:uppercase}.cv-visually-hidden{display:none}.cv-pre{white-space:pre-wrap}`

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

const has = (s: string) => s.trim() !== ''
const trust = (t: Trust) => `<p class="cv-trust">${esc(C.trust[t])}</p>`
const li = (html: string) => `<li>${html}</li>`
const row = (label: string, value: string) => `<tr><th scope="row">${esc(label)}</th><td>${esc(value)}</td></tr>`
const doi = (d: string) => (d ? `. DOI: ${esc(d)}` : '')

/** The CV as an HTML fragment, mirroring CvDocument.tsx element for element. */
export function cvBodyHtml(cv: Cv): string {
  const hec = cv.template === 'hec'
  const h = cv.header
  const c = cv.contact
  const id = cv.identifiers
  const out: string[] = []

  out.push(
    `<article class="cv cv-${cv.template}" lang="en" aria-labelledby="cv-name" data-testid="cv-document">`,
    '<header class="cv-head">',
    cv.sample ? `<p class="cv-sample">${esc(C.sampleLabel)}</p>` : '',
    `<h1 id="cv-name">${esc(h.nameEn)}</h1>`,
    `<p class="cv-name-ur" lang="ur" dir="rtl">${esc(h.nameUr)}</p>`,
    `<p>${esc(h.designation)}, ${esc(h.department)}</p>`,
    h.email ? `<p>${esc(C.emailLabel)}: ${esc(h.email)}</p>` : '',
    trust(cv.trust.header),
    '</header>',
    `<section class="cv-cover" aria-label="${esc(C.coverTitle)}">`,
    `<p>${esc(C.generatedOn(cv.generatedOn))}</p>`,
    `<p>${esc(C.unverifiedNote)}</p>`,
    `<p>${esc(C.layoutNote[cv.template])}</p>`,
    '</section>',
  )

  if (hec) {
    out.push(
      '<section aria-labelledby="cv-personal">',
      `<h2 id="cv-personal">${esc(C.personal)}</h2>`,
      '<table class="cv-table"><tbody>',
      row(C.nameLabel, h.nameEn),
      row(C.designationLabel, h.designation),
      row(C.departmentLabel, h.department),
      h.email ? row(C.emailLabel, h.email) : '',
      has(c.officeLocation) ? row(C.officeLocation, c.officeLocation) : '',
      has(c.officeHours) ? row(C.officeHours, c.officeHours) : '',
      has(id.orcid) ? row(C.orcid, id.orcid) : '',
      has(id.scholarUrl) ? row(C.scholar, id.scholarUrl) : '',
      has(id.cvLink) ? row(C.cvLink, id.cvLink) : '',
      '</tbody></table>',
      trust(cv.trust.contact),
      '</section>',
    )
  }

  if (has(cv.bio.en) || has(cv.bio.ur)) {
    out.push(
      '<section aria-labelledby="cv-about">',
      `<h2 id="cv-about">${esc(hec ? C.profileSummary : C.about)}</h2>`,
      has(cv.bio.en) ? `<p lang="en" class="cv-pre">${esc(cv.bio.en)}</p>` : '',
      has(cv.bio.ur) ? `<p lang="ur" dir="rtl" class="cv-pre">${esc(cv.bio.ur)}</p>` : '',
      trust(cv.trust.bio),
      '</section>',
    )
  }

  if (cv.interests.length > 0) {
    out.push('<section aria-labelledby="cv-interests">', `<h2 id="cv-interests">${esc(C.interests)}</h2>`, `<ul>${cv.interests.map((i) => li(esc(i))).join('')}</ul>`, trust(cv.trust.interests), '</section>')
  }

  if (!hec && (has(c.officeLocation) || has(c.officeHours) || has(id.orcid) || has(id.scholarUrl) || has(id.cvLink))) {
    const items = [
      has(c.officeLocation) ? li(`${esc(C.officeLocation)}: ${esc(c.officeLocation)}`) : '',
      has(c.officeHours) ? li(`${esc(C.officeHours)}: ${esc(c.officeHours)}`) : '',
      has(id.orcid) ? li(`${esc(C.orcid)}: ${esc(id.orcid)}`) : '',
      has(id.scholarUrl) ? li(`${esc(C.scholar)}: ${esc(id.scholarUrl)}`) : '',
      has(id.cvLink) ? li(`${esc(C.cvLink)}: ${esc(id.cvLink)}`) : '',
    ]
    out.push('<section aria-labelledby="cv-contact">', `<h2 id="cv-contact">${esc(C.contact)}</h2>`, `<ul>${items.join('')}</ul>`, trust(cv.trust.contact), '</section>')
  }

  out.push('<section aria-labelledby="cv-pubs">', `<h2 id="cv-pubs">${esc(C.publications)}</h2>`)
  if (cv.publications.length === 0) out.push(`<p>${esc(C.noPublications)}</p>`)
  else if (hec) {
    out.push(`<ol>${cv.publications.map((w) => li(`<span dir="auto">${esc(w.authors.join(', '))}</span>. (${w.year}). <span dir="auto">${esc(w.title)}</span>. ${esc(w.venue)}${doi(w.doi)}`)).join('')}</ol>`)
  } else {
    out.push(`<ul>${cv.publications.map((w) => li(`<strong dir="auto">${esc(w.title)}</strong> (${w.year}). ${esc(w.venue)}${doi(w.doi)}`)).join('')}</ul>`)
  }
  out.push(trust(cv.trust.publications), '</section>')

  out.push('<section aria-labelledby="cv-courses">', `<h2 id="cv-courses">${esc(C.courses)}</h2>`)
  if (cv.courses.length === 0) out.push(`<p>${esc(C.noCourses)}</p>`)
  else if (hec) {
    out.push(
      '<table class="cv-table">',
      `<caption class="cv-visually-hidden">${esc(C.courses)}</caption>`,
      `<thead><tr><th scope="col">${esc(C.colCode)}</th><th scope="col">${esc(C.colTitle)}</th><th scope="col">${esc(C.colSemester)}</th><th scope="col">${esc(C.colProgramme)}</th></tr></thead>`,
      `<tbody>${cv.courses.map((k) => `<tr><td>${esc(k.code)}</td><td dir="auto">${esc(k.title)}</td><td>${esc(k.semester)}</td><td dir="auto">${esc(k.programme)}</td></tr>`).join('')}</tbody>`,
      '</table>',
    )
  } else {
    out.push(`<ul>${cv.courses.map((k) => li(`${esc(k.code)}, <span dir="auto">${esc(k.title)}</span> (${esc(k.semester)})${k.programme ? `, ${esc(k.programme)}` : ''}`)).join('')}</ul>`)
  }
  out.push(trust(cv.trust.courses), '</section>', '</article>')

  return out.join('')
}

/** A complete HTML file that Word opens. */
export function cvWordHtml(cv: Cv): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CV</title><style>${STYLE}</style></head><body>${cvBodyHtml(cv)}</body></html>`
}
