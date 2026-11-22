import Link from 'next/link'

import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import { COPY } from '@/modules/portal/copy'
import { isHeadAccount } from '@/modules/portal/activation/wiring'
import { createSampleProfileStore } from '@/modules/portal/profile/sampleStore'
import { isVerifierAccount } from '@/modules/portal/registrar/wiring'
import { isReviewerAccount } from '@/modules/portal/review/wiring'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.home.title }

export default async function PortalHome() {
  const { email, userId } = await requirePortalPage('/portal')
  const reviewer = userId ? await isReviewerAccount(userId) : false
  const head = userId ? await isHeadAccount(userId) : false
  const registrar = userId ? await isVerifierAccount(userId) : false
  const config = readPortalConfig(process.env)
  // The person's own card. A read failure leaves the card out rather than breaking the page.
  const loaded =
    config.enabled && userId && email
      ? await createSampleProfileStore(getIdentityPool(config.databaseUrl))
          .load({ id: userId, email })
          .catch(() => null)
      : null
  const T = COPY.home.tiles
  const tiles: Array<[string, string, string]> = [
    ['/portal/profile', COPY.home.profileLink, T.profile],
    ['/portal/publications', COPY.home.publicationsLink, T.publications],
    ['/portal/courses', COPY.home.coursesLink, T.courses],
    ['/portal/cv', COPY.home.cvLink, T.cv],
    ['/portal/delegation', COPY.home.delegationLink, T.delegation],
    ['/portal/notifications', COPY.home.notificationsLink, T.notifications],
    ...(head
      ? ([['/portal/activate', COPY.home.activateLink, T.activate]] as Array<
          [string, string, string]
        >)
      : []),
    ...(reviewer
      ? ([['/portal/review', COPY.home.reviewLink, T.review]] as Array<[string, string, string]>)
      : []),
    ...(registrar
      ? ([['/portal/registrar', COPY.home.registrarLink, T.registrar]] as Array<[string, string, string]>)
      : []),
    ['/portal/security', COPY.home.securityLink, T.security],
  ]
  return (
    <Shell email={email} wide>
      <div className="portal-hero">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative illustration from the app's own public folder */}
        <img src="/portal-avatars/portal-hero.svg" alt="" width={1600} height={220} />
        <div className="portal-hero-card">
          {loaded?.profile.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- a small illustration from the app's own public folder
            <img
              className="portal-avatar portal-avatar-lg"
              src={loaded.profile.photo}
              alt=""
              width={96}
              height={96}
            />
          ) : null}
          <div>
            <h1>{loaded ? loaded.profile.name.en : COPY.home.title}</h1>
            {loaded ? (
              <p>
                {loaded.profile.designation.en}, {loaded.profile.department}
              </p>
            ) : (
              <p>{COPY.home.intro}</p>
            )}
            <p className="hint">
              {COPY.home.signedInAs} <strong>{email}</strong>
            </p>
          </div>
        </div>
      </div>
      <ul className="portal-tiles">
        {tiles.map(([href, label, hint]) => (
          <li key={href}>
            <Link className="portal-tile" href={href}>
              <span className="portal-tile-title">{label}</span>
              <span className="portal-tile-hint">{hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  )
}
