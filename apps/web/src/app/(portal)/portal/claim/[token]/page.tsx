import { COPY } from '@/modules/portal/copy'
import ClaimForm from '@/modules/portal/claim/ClaimForm'
import { claimService } from '@/modules/portal/claim/wiring'
import { looksLikeToken } from '@/modules/identity/invitations'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
// The link is a secret: never send it on as a Referer, and keep it out of search results.
export const metadata = { title: COPY.claim.title, referrer: 'no-referrer' as const, robots: { index: false, follow: false } }

const C = COPY.claim

export default async function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  // A public page: the guard only checks that the portal is on and sends a fully signed-in visitor home.
  await requirePortalPage('/portal/sign-in')
  const who = looksLikeToken(token) ? await claimService().preview(token).catch(() => null) : null
  return (
    <Shell>
      {who ? (
        <>
          <h1>{C.title} <span className="portal-sample">{C.sampleBadge}</span></h1>
          <p data-testid="claim-intro">{C.intro(who.name, who.email)}</p>
          <p>{C.steps}</p>
          <ClaimForm token={token} />
        </>
      ) : (
        <>
          <h1>{C.unavailableTitle}</h1>
          <p data-testid="claim-unavailable">{C.unavailable}</p>
        </>
      )}
    </Shell>
  )
}
