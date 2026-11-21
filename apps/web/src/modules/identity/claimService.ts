/**
 * Claiming an invitation (FP-01). Free of Next and PostgreSQL so it is tested directly.
 * A bad, used, revoked or expired link all answer 'unavailable', so the answer reveals nothing about the record.
 * Order: read the link without using it, create the account through the library, then use the link and write the pending status in
 * one transaction. If using the link fails (someone else got there first), the new account is removed again.
 */
import type { InvitationStore, OpenInvitation } from './invitations'

export const PASSWORD_MIN = 15
export const PASSWORD_MAX = 128

export type ClaimDeps = {
  invitations: Pick<InvitationStore, 'peek' | 'consume'>
  accounts: {
    create(input: { email: string; password: string; name: string }): Promise<{ id: string }>
    /** Removes the account and everything hanging off it (cascade). Used only to undo a half-finished claim. */
    remove(userId: string): Promise<void>
    /** Ends any session the creation left behind: the person signs in properly, with the password, next. */
    endSessions(userId: string): Promise<void>
  }
  now?: () => number
}

export type ClaimResult = { ok: true } | { ok: false; error: 'unavailable' | 'password' }

export function createClaimService(deps: ClaimDeps) {
  const now = deps.now ?? Date.now
  return {
    /** What the claim page may show for this link: the name and address it was sent to, nothing else. */
    async preview(token: unknown): Promise<Pick<OpenInvitation, 'name' | 'email'> | null> {
      if (typeof token !== 'string') return null
      const inv = await deps.invitations.peek(token, now())
      return inv ? { name: inv.name, email: inv.email } : null
    },

    async claim(token: unknown, password: unknown): Promise<ClaimResult> {
      if (typeof token !== 'string') return { ok: false, error: 'unavailable' }
      const inv = await deps.invitations.peek(token, now())
      if (!inv) return { ok: false, error: 'unavailable' }
      if (typeof password !== 'string' || [...password].length < PASSWORD_MIN || password.length > PASSWORD_MAX) return { ok: false, error: 'password' }

      let user: { id: string }
      try {
        user = await deps.accounts.create({ email: inv.email, password, name: inv.name })
      } catch {
        // The address already has an account, or the library refused: say nothing more than "this link does not work".
        return { ok: false, error: 'unavailable' }
      }
      try {
        await deps.accounts.endSessions(user.id)
        const used = await deps.invitations.consume(token, user.id, now())
        if (used !== 'ok') {
          await deps.accounts.remove(user.id)
          return { ok: false, error: 'unavailable' }
        }
        return { ok: true }
      } catch (e) {
        // Never leave an account with no claim record behind: it would be active, because no status row means active.
        await deps.accounts.remove(user.id).catch(() => {})
        throw e
      }
    },
  }
}
