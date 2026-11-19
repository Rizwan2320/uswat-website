/**
 * What a profile action does, free of Next and PostgreSQL so it is tested directly. The account comes from `getAccount`
 * (the session) and never from the request; the request carries only the edit, which must pass the allow-list in `rules.ts`.
 */
import { validateEdit, type FieldErrors } from './rules'
import type { ProfileStore } from './types'

export type Account = { id: string; email: string }

export type ActionResult =
  | { ok: true }
  | { ok: false; error: 'session' | 'invalid' | 'locked' | 'nothing'; errors?: FieldErrors }

export function createProfileService(deps: { store: ProfileStore; getAccount: () => Promise<Account | null> }) {
  return {
    async save(input: unknown): Promise<ActionResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      const v = validateEdit(input)
      if (!v.ok) return { ok: false, error: 'invalid', errors: v.errors }
      return (await deps.store.saveDraft(account.id, v.edit)) ? { ok: true } : { ok: false, error: 'locked' }
    },
    async submit(): Promise<ActionResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      return (await deps.store.submit(account.id)) ? { ok: true } : { ok: false, error: 'nothing' }
    },
    async withdraw(): Promise<ActionResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      return (await deps.store.withdraw(account.id)) ? { ok: true } : { ok: false, error: 'nothing' }
    },
  }
}
