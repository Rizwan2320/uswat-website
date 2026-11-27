/** Which extra links the header shows. Display only: every one of those pages checks the role again itself, so a wrong answer here can only hide or show a link. */
import { readPortalConfig } from '../identity/config'
import { getIdentityPool } from '../identity/db'

export type HeaderRoles = { review: boolean; activate: boolean; registrar: boolean }
const NONE: HeaderRoles = { review: false, activate: false, registrar: false }

export async function headerRoles(email: string | null | undefined): Promise<HeaderRoles> {
  if (!email) return NONE
  const config = readPortalConfig(process.env)
  if (!config.enabled) return NONE
  try {
    const { rows } = await getIdentityPool(config.databaseUrl).query<{ review: boolean; activate: boolean; registrar: boolean }>(
      `select exists (select 1 from "reviewer_role" r where r."userId" = u."id") as review,
              exists (select 1 from "head_role" h where h."userId" = u."id") as activate,
              exists (select 1 from "verifier_role" v where v."userId" = u."id") as registrar
         from "user" u where lower(u."email") = lower($1) limit 1`,
      [email],
    )
    return rows[0] ?? NONE
  } catch {
    return NONE
  }
}
