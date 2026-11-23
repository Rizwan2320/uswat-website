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
import { profileState } from '@/modules/portal/homeState'
import Icon, { type IconName } from '@/modules/portal/icons'
import Valley from '@/modules/portal/Valley'

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
  type Tile = { href: string; label: string; hint: string; icon: IconName }
  const page: Tile[] = [
    { href: '/portal/profile', label: COPY.home.profileLink, hint: T.profile, icon: 'profile' },
    { href: '/portal/publications', label: COPY.home.publicationsLink, hint: T.publications, icon: 'publications' },
    { href: '/portal/courses', label: COPY.home.coursesLink, hint: T.courses, icon: 'courses' },
    { href: '/portal/cv', label: COPY.home.cvLink, hint: T.cv, icon: 'cv' },
  ]
  const account: Tile[] = [
    { href: '/portal/delegation', label: COPY.home.delegationLink, hint: T.delegation, icon: 'delegation' },
    { href: '/portal/notifications', label: COPY.home.notificationsLink, hint: T.notifications, icon: 'notifications' },
    { href: '/portal/security', label: COPY.home.securityLink, hint: T.security, icon: 'security' },
  ]
  const duties: Tile[] = [
    ...(head ? [{ href: '/portal/activate', label: COPY.home.activateLink, hint: T.activate, icon: 'activate' } as Tile] : []),
    ...(reviewer ? [{ href: '/portal/review', label: COPY.home.reviewLink, hint: T.review, icon: 'review' } as Tile] : []),
    ...(registrar ? [{ href: '/portal/registrar', label: COPY.home.registrarLink, hint: T.registrar, icon: 'registrar' } as Tile] : []),
  ]
  const state = loaded ? profileState(loaded) : null
  const S: { label: string; next?: string; nextHelp?: string } | null = state ? COPY.home.state[state] : null
  const G = COPY.home.groups
  const tile = (t: Tile, extra = '') => (
    <li key={t.href}>
      <Link className={`portal-tile${extra}`} href={t.href}>
        <span className="portal-tile-icon"><Icon name={t.icon} /></span>
        <span className="portal-tile-title">{t.label}</span>
        <span className="portal-tile-hint">{t.hint}</span>
      </Link>
    </li>
  )
  return (
    <Shell email={email} wide>
      <section className="home-hero" aria-labelledby="home-name">
        <Valley className="home-valley" width={1600} height={340} sun={0.7} />
        <div className="home-who">
          {loaded?.profile.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- a small illustration from the app's own public folder
            <img className="home-avatar" src={loaded.profile.photo} alt="" width={112} height={112} />
          ) : null}
          <div>
            <h1 id="home-name">{loaded ? loaded.profile.name.en : COPY.home.title}</h1>
            <p className="home-role">{loaded ? `${loaded.profile.designation.en}, ${loaded.profile.department}` : COPY.home.intro}</p>
          </div>
        </div>
        {S ? <p className={`home-chip is-${state}`} data-testid="home-state">{S.label}</p> : null}
      </section>

      {S && S.next ? (
        <Link className="home-next" href="/portal/profile" data-testid="home-next">
          <span><strong>{S.next}</strong><span>{S.nextHelp}</span></span>
        </Link>
      ) : null}

      <h2 className="home-group">{G.page}</h2>
      <ul className="portal-tiles portal-tiles-page">{page.map((t) => tile(t))}</ul>

      <h2 className="home-group">{G.account}</h2>
      <ul className="portal-tiles portal-tiles-account">{account.map((t) => tile(t))}</ul>

      {duties.length > 0 ? (
        <>
          <h2 className="home-group">{G.duties}</h2>
          <ul className="portal-tiles portal-tiles-duties">{duties.map((t) => tile(t, ' is-duty'))}</ul>
        </>
      ) : null}
    </Shell>
  )
}
