/**
 * Turns whatever the auth client reports into one of the sentences in ./copy. Nothing from the
 * server is ever shown as it is, so no message can leak a stack, a query or whether an account exists
 * (AUTH-10: an unknown email and a wrong password read the same).
 */
import { COPY } from './copy'

type Reported = { code?: unknown; status?: unknown; message?: unknown }

export function mapAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') return COPY.errors.generic
  const { code, status, message } = error as Reported
  const c = typeof code === 'string' ? code : ''
  const m = typeof message === 'string' ? message : ''

  if (status === 429) return COPY.errors.tooMany
  if (c === 'AUTHENTICATION_FAILED') return COPY.errors.passkeyFailed
  if (c === 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY') return COPY.errors.passkeyCancelled
  if (c === 'INVALID_CODE' || /invalid code/i.test(m)) return COPY.errors.badCode
  if (
    c === 'INVALID_EMAIL_OR_PASSWORD' ||
    c === 'USER_NOT_FOUND' ||
    c === 'INVALID_PASSWORD' ||
    /invalid (email|credentials|password)/i.test(m)
  ) {
    return COPY.errors.badCredentials
  }
  return COPY.errors.generic
}
