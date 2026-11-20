import { COPY } from '../copy'
import type { Preview } from './rules'

const C = COPY.profile

/** What the public would see (FP-04). Pure rendering of `buildPreview`'s output; it decides nothing about visibility. */
export default function PublicPreview({ preview, heading, idSuffix = '', help, testId = 'public-preview' }: { preview: Preview; heading?: string; idSuffix?: string; help?: string; testId?: string }) {
  const rows: Array<[string, string]> = []
  if (preview.email) rows.push([C.previewEmail, preview.email])
  if (preview.officeLocation) rows.push([C.previewOffice, preview.officeLocation])
  if (preview.officeHours) rows.push([C.previewHours, preview.officeHours])
  if (preview.researchInterests.length > 0) rows.push([C.previewInterests, preview.researchInterests.join(', ')])
  const links = [
    preview.orcid ? `ORCID ${preview.orcid}` : '',
    preview.scholarUrl,
    preview.cvLink,
  ].filter(Boolean)
  const empty = !preview.bio.en && !preview.bio.ur && rows.length === 0 && links.length === 0
  return (
    <section className="portal-preview" aria-labelledby={`preview-title${idSuffix}`} data-testid={testId}>
      <h2 id={`preview-title${idSuffix}`}>{heading ?? C.previewTitle}{' '}{preview.sample ? <span className="portal-sample">{C.sampleBadge}</span> : null}</h2>
      <p className="hint">{help ?? C.previewHelp}</p>
      <div className="photo">{preview.showPhoto ? C.previewPhoto : C.previewNoPhoto}</div>
      <h3>{preview.name.en}</h3>
      <p className="role">{preview.designation.en}, {preview.department}</p>
      {preview.bio.en ? <p lang="en">{preview.bio.en}</p> : null}
      {preview.bio.ur ? <p lang="ur" dir="rtl">{preview.bio.ur}</p> : null}
      {rows.length > 0 ? (
        <dl>
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {links.length > 0 ? (
        <>
          <h4>{C.previewLinks}</h4>
          <ul>{links.map((l) => <li key={l}>{l}</li>)}</ul>
        </>
      ) : null}
      {empty ? <p className="empty">{C.previewEmpty}</p> : null}
    </section>
  )
}
