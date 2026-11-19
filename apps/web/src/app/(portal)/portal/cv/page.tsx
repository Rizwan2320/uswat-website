import Link from 'next/link'

import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import { COPY } from '@/modules/portal/copy'
import { buildCv, isTemplate, TEMPLATES } from '@/modules/portal/cv/build'
import CvDocument from '@/modules/portal/cv/CvDocument'
import { currentTime, loadCvInput } from '@/modules/portal/cv/data'
import PrintButton from '@/modules/portal/cv/PrintButton'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.cv.title }

export default async function CvPage({ searchParams }: { searchParams: Promise<{ template?: string | string[] }> }) {
  const { userId, email } = await requirePortalPage('/portal/cv')
  const config = readPortalConfig(process.env)
  if (!config.enabled || !userId || !email) return null
  const raw = (await searchParams).template
  const template = isTemplate(raw) ? raw : 'university'
  const cv = buildCv(await loadCvInput(getIdentityPool(config.databaseUrl), { id: userId, email }), template, currentTime())
  return (
    <Shell email={email} wide>
      <div className="cv-tools">
        <h1>{COPY.cv.title}</h1>
        <p>{COPY.cv.intro}</p>
        <nav aria-label={COPY.cv.layoutLabel} className="cv-layouts">
          {TEMPLATES.map((t) => (
            <Link key={t} href={`/portal/cv?template=${t}`} aria-current={t === template ? 'page' : undefined} className={t === template ? 'cv-layout on' : 'cv-layout'}>{COPY.cv.layouts[t]}</Link>
          ))}
        </nav>
        <div className="portal-actions">
          <PrintButton />
          <a className="portal-btn secondary" href={`/portal/cv/word?template=${template}`} download>{COPY.cv.word}</a>
        </div>
        <p className="hint">{COPY.cv.printHelp} {COPY.cv.wordHelp}</p>
        {cv.header.email === null ? <p className="hint">{COPY.cv.emailHidden}</p> : null}
      </div>
      <CvDocument cv={cv} />
    </Shell>
  )
}
