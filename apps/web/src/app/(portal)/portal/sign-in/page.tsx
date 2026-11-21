import { COPY } from '@/modules/portal/copy'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'
import SignInForm from '@/modules/portal/SignInForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.signIn.title }

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  await requirePortalPage('/portal/sign-in')
  const { reason } = await searchParams
  const notices: Record<string, string> = {
    expired: COPY.signIn.expired,
    'second-factor': COPY.signIn.needSecondFactor,
    claimed: COPY.signIn.claimed,
    'signed-out-everywhere': COPY.signIn.signedOutEverywhere,
    'not-me': COPY.signIn.notMe,
    'not-me-no-alert': COPY.signIn.notMeNoAlert,
  }
  const notice = reason && Object.hasOwn(notices, reason) ? notices[reason] : null
  return (
    <Shell>
      <h1>{COPY.signIn.title}</h1>
      <p>{COPY.signIn.intro}</p>
      {notice ? <p className="portal-notice" role="status">{notice}</p> : null}
      <SignInForm />
    </Shell>
  )
}
