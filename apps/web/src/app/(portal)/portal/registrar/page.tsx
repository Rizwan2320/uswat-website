import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { COPY } from '@/modules/portal/copy'
import { SEARCH_MAX } from '@/modules/portal/registrar/rules'
import { registrarService } from '@/modules/portal/registrar/wiring'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.registrar.title }

const C = COPY.registrar

export default async function RegistrarPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { email } = await requirePortalPage('/portal/registrar')
  const { q } = await searchParams
  const term = (typeof q === 'string' ? q : '').slice(0, SEARCH_MAX)
  const r = await registrarService('/portal/registrar').search(term)
  if (!r.ok) {
    // Not a Registrar looks the same as a page that does not exist.
    if (r.error === 'session') redirect('/portal/sign-in?reason=expired')
    notFound()
  }
  const searched = term.trim().length >= 2
  return (
    <Shell email={email} wide>
      <h1>{C.title} <span className="portal-sample">{C.sampleBadge}</span></h1>
      <p>{C.intro}</p>
      <form method="get" action="/portal/registrar" className="portal-search" role="search">
        <div className="portal-field">
          <label htmlFor="registrar-q">{C.searchLabel}</label>
          <input id="registrar-q" name="q" type="search" defaultValue={term} maxLength={SEARCH_MAX} aria-describedby="registrar-q-hint" data-testid="registrar-search" />
          <span id="registrar-q-hint" className="hint">{C.searchHint}</span>
        </div>
        <div className="portal-actions"><button type="submit" className="portal-btn">{C.searchButton}</button></div>
      </form>
      {!searched ? (
        <p className="hint">{C.typeMore}</p>
      ) : r.people.length === 0 ? (
        <p data-testid="registrar-none">{C.none}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table" data-testid="registrar-results">
            <thead>
              <tr><th scope="col">{C.colPerson}</th><th scope="col">{C.colDepartment}</th><th scope="col">{C.colDesignation}</th><th scope="col"><span className="portal-sr-only">{C.open}</span></th></tr>
            </thead>
            <tbody>
              {r.people.map((p) => (
                <tr key={p.subjectId}>
                  <th scope="row">{p.name}<br /><span className="hint">{p.email}</span></th>
                  <td>{p.department ?? C.notSet}</td>
                  <td>{p.designationEn ?? C.notSet}</td>
                  <td><Link className="portal-link" href={`/portal/registrar/${p.subjectId}`} aria-label={`${C.open}: ${p.name}`}>{C.open}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  )
}
