import { createClaimService } from '../../identity/claimService'
import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { createPgInvitationStore } from '../../identity/invitations'
import { getPortalAuth } from '../deps'

/** The claim service, built from server code only. Creating the account is the one place sign-up is used, and only after a valid link. */
export function claimService() {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  const pool = getIdentityPool(config.databaseUrl)
  return createClaimService({
    invitations: createPgInvitationStore(pool),
    accounts: {
      create: async ({ email, password, name }) => ({ id: (await getPortalAuth().api.signUpEmail({ body: { email, password, name } })).user.id }),
      remove: async (id) => void (await pool.query(`delete from "user" where "id" = $1`, [id])),
      endSessions: async (id) => void (await pool.query(`delete from "session" where "userId" = $1`, [id])),
    },
  })
}
