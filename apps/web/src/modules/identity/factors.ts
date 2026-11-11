/** Reads the second-factor state the enrolment gate needs. Read-only. */
import type pg from 'pg'

import type { FactorState } from './gate'

export async function loadFactors(pool: pg.Pool, userId: string): Promise<FactorState> {
  const { rows } = await pool.query<{ passkeys: string; totp: boolean; recovery: string }>(
    `select
       (select count(*) from "passkey" where "userId" = $1)::text as passkeys,
       exists (select 1 from "twoFactor" where "userId" = $1 and "verified" is true) as totp,
       (select count(*) from "recovery_code" where "userId" = $1 and "usedAt" is null)::text as recovery`,
    [userId],
  )
  const r = rows[0]
  return {
    passkeys: Number(r?.passkeys ?? 0),
    totpVerified: r?.totp === true,
    recoveryCodesRemaining: Number(r?.recovery ?? 0),
  }
}
