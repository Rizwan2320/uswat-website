import { COPY } from '@/modules/portal/copy'
import EnrolFlow from '@/modules/portal/EnrolFlow'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.enrol.title }

export default async function EnrolPage() {
  const { email } = await requirePortalPage('/portal/enrol')
  return (
    <Shell email={email}>
      <h1>{COPY.enrol.title}</h1>
      <p>{COPY.enrol.intro}</p>
      <EnrolFlow />
    </Shell>
  )
}
