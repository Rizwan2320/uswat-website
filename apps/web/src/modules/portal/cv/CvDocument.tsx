import { COPY } from '../copy'
import type { Cv, Trust } from './build'

const C = COPY.cv

function TrustNote({ trust }: { trust: Trust }) {
  return <p className="cv-trust">{C.trust[trust]}</p>
}

/** The CV itself. Plain semantic HTML (headings, lists, a table) so the browser's PDF is tagged and Word can open it. */
export default function CvDocument({ cv }: { cv: Cv }) {
  const hec = cv.template === 'hec'
  const h = cv.header
  const has = (s: string) => s.trim() !== ''
  return (
    <article className={`cv cv-${cv.template}`} lang="en" aria-labelledby="cv-name" data-testid="cv-document">
      <header className="cv-head">
        {cv.sample ? <p className="cv-sample">{C.sampleLabel}</p> : null}
        {h.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- a small illustration from the app's own public folder
          <img className="portal-avatar cv-photo" src={h.photo} alt="" width={96} height={96} />
        ) : null}
        <h1 id="cv-name">{h.nameEn}</h1>
        <p className="cv-name-ur" lang="ur" dir="rtl">{h.nameUr}</p>
        <p>{h.designation}, {h.department}</p>
        {h.email ? <p>{C.emailLabel}: {h.email}</p> : null}
        <TrustNote trust={cv.trust.header} />
      </header>

      <section className="cv-cover" aria-label={C.coverTitle}>
        <p>{C.generatedOn(cv.generatedOn)}</p>
        <p>{C.unverifiedNote}</p>
        <p>{C.layoutNote[cv.template]}</p>
      </section>

      {hec ? (
        <section aria-labelledby="cv-personal">
          <h2 id="cv-personal">{C.personal}</h2>
          <table className="cv-table">
            <tbody>
              <tr><th scope="row">{C.nameLabel}</th><td>{h.nameEn}</td></tr>
              <tr><th scope="row">{C.designationLabel}</th><td>{h.designation}</td></tr>
              <tr><th scope="row">{C.departmentLabel}</th><td>{h.department}</td></tr>
              {h.email ? <tr><th scope="row">{C.emailLabel}</th><td>{h.email}</td></tr> : null}
              {has(cv.contact.officeLocation) ? <tr><th scope="row">{C.officeLocation}</th><td>{cv.contact.officeLocation}</td></tr> : null}
              {has(cv.contact.officeHours) ? <tr><th scope="row">{C.officeHours}</th><td>{cv.contact.officeHours}</td></tr> : null}
              {has(cv.identifiers.orcid) ? <tr><th scope="row">{C.orcid}</th><td>{cv.identifiers.orcid}</td></tr> : null}
              {has(cv.identifiers.scholarUrl) ? <tr><th scope="row">{C.scholar}</th><td>{cv.identifiers.scholarUrl}</td></tr> : null}
              {has(cv.identifiers.cvLink) ? <tr><th scope="row">{C.cvLink}</th><td>{cv.identifiers.cvLink}</td></tr> : null}
            </tbody>
          </table>
          <TrustNote trust={cv.trust.contact} />
        </section>
      ) : null}

      {has(cv.bio.en) || has(cv.bio.ur) ? (
        <section aria-labelledby="cv-about">
          <h2 id="cv-about">{hec ? C.profileSummary : C.about}</h2>
          {has(cv.bio.en) ? <p lang="en" className="cv-pre">{cv.bio.en}</p> : null}
          {has(cv.bio.ur) ? <p lang="ur" dir="rtl" className="cv-pre">{cv.bio.ur}</p> : null}
          <TrustNote trust={cv.trust.bio} />
        </section>
      ) : null}

      {cv.interests.length > 0 ? (
        <section aria-labelledby="cv-interests">
          <h2 id="cv-interests">{C.interests}</h2>
          <ul>{cv.interests.map((i) => <li key={i}>{i}</li>)}</ul>
          <TrustNote trust={cv.trust.interests} />
        </section>
      ) : null}

      {!hec && (has(cv.contact.officeLocation) || has(cv.contact.officeHours) || has(cv.identifiers.orcid) || has(cv.identifiers.scholarUrl) || has(cv.identifiers.cvLink)) ? (
        <section aria-labelledby="cv-contact">
          <h2 id="cv-contact">{C.contact}</h2>
          <ul>
            {has(cv.contact.officeLocation) ? <li>{C.officeLocation}: {cv.contact.officeLocation}</li> : null}
            {has(cv.contact.officeHours) ? <li>{C.officeHours}: {cv.contact.officeHours}</li> : null}
            {has(cv.identifiers.orcid) ? <li>{C.orcid}: {cv.identifiers.orcid}</li> : null}
            {has(cv.identifiers.scholarUrl) ? <li>{C.scholar}: {cv.identifiers.scholarUrl}</li> : null}
            {has(cv.identifiers.cvLink) ? <li>{C.cvLink}: {cv.identifiers.cvLink}</li> : null}
          </ul>
          <TrustNote trust={cv.trust.contact} />
        </section>
      ) : null}

      <section aria-labelledby="cv-pubs">
        <h2 id="cv-pubs">{C.publications}</h2>
        {cv.publications.length === 0 ? <p>{C.noPublications}</p> : hec ? (
          <ol>
            {cv.publications.map((w) => (
              <li key={`${w.title}-${w.year}`}><span dir="auto">{w.authors.join(', ')}</span>. ({w.year}). <span dir="auto">{w.title}</span>. {w.venue}{w.doi ? `. DOI: ${w.doi}` : ''}</li>
            ))}
          </ol>
        ) : (
          <ul>
            {cv.publications.map((w) => (
              <li key={`${w.title}-${w.year}`}><strong dir="auto">{w.title}</strong> ({w.year}). {w.venue}{w.doi ? `. DOI: ${w.doi}` : ''}</li>
            ))}
          </ul>
        )}
        <TrustNote trust={cv.trust.publications} />
      </section>

      <section aria-labelledby="cv-courses">
        <h2 id="cv-courses">{C.courses}</h2>
        {cv.courses.length === 0 ? <p>{C.noCourses}</p> : hec ? (
          <table className="cv-table">
            <caption className="cv-visually-hidden">{C.courses}</caption>
            <thead><tr><th scope="col">{C.colCode}</th><th scope="col">{C.colTitle}</th><th scope="col">{C.colSemester}</th><th scope="col">{C.colProgramme}</th></tr></thead>
            <tbody>{cv.courses.map((c) => <tr key={`${c.code}-${c.semester}`}><td>{c.code}</td><td dir="auto">{c.title}</td><td>{c.semester}</td><td dir="auto">{c.programme}</td></tr>)}</tbody>
          </table>
        ) : (
          <ul>{cv.courses.map((c) => <li key={`${c.code}-${c.semester}`}>{c.code}, <span dir="auto">{c.title}</span> ({c.semester}){c.programme ? `, ${c.programme}` : ''}</li>)}</ul>
        )}
        <TrustNote trust={cv.trust.courses} />
      </section>
    </article>
  )
}
