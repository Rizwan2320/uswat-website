import { COPY } from '@/modules/portal/copy'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'
import SignInForm from '@/modules/portal/SignInForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.signIn.title }

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  await requirePortalPage('/portal/sign-in')
  const { reason } = await searchParams
  const notice = reason === 'expired' ? COPY.signIn.expired : reason === 'second-factor' ? COPY.signIn.needSecondFactor : null
  return (
    <Shell>
      <h1>{COPY.signIn.title}</h1>
      <p>{COPY.signIn.intro}</p>
      {notice ? <p className="portal-notice" role="status">{notice}</p> : null}
      <SignInForm />
    </Shell>
  )
}
