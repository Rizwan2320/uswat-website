/** Which candidate source and DOI lookup the portal uses. The sample list stays the default; real calls are opt-in per source. */
import { createCrossrefLookup, type DoiLookup } from './crossref'
import { createOpenAlexSource } from './openAlexSource'
import { sampleSource } from './sampleSource'
import type { CandidateSource } from './types'

type Env = Record<string, string | undefined>

export function resolveSource(env: Env): CandidateSource {
  return env.PORTAL_PUBLICATIONS_SOURCE === 'openalex' ? createOpenAlexSource({ mailto: env.PORTAL_CONTACT_EMAIL }) : sampleSource
}

/** The DOI lookup is on by default (a person pressed Look up; only a public DOI leaves the server). `PORTAL_DOI_LOOKUP=off` turns it off. */
export function resolveLookup(env: Env): DoiLookup | null {
  return env.PORTAL_DOI_LOOKUP === 'off' ? null : createCrossrefLookup({ mailto: env.PORTAL_CONTACT_EMAIL })
}
