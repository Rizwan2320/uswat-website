/**
 * Team administration (slice 3hod, docs/briefs/p3hod-team.md, gap D1): a Head of Department, an
 * Approver, manages the Editors and Contributors of the offices they hold themselves.
 *
 * Pure functions, no Payload imports, so every rule is covered by a case table without a database.
 * The Users collection hooks are thin adapters around them. These checks are the real gate: field
 * access and `where` filters only decide what is visible and which requests reach the hooks.
 *
 * An Approver MAY (for their own offices only): create an Editor or Contributor; change a team
 * member's role between those two and add or take away one of their own offices; delete a person
 * who works for none but their offices.
 * An Approver may NEVER: grant any other role; touch an account that holds another role; give or
 * take an office that is not theirs; change a team member's name, email or password; leave a person
 * with no office (delete the account instead); change their own role or offices.
 */

import { normalizeOffice, type Actor } from './roles'

export const TEAM_ROLES = ['editor', 'contributor'] as const
export type TeamRole = (typeof TEAM_ROLES)[number]

export type TeamCode =
  | 'TEAM_ROLE_FORBIDDEN'
  | 'TEAM_OFFICE_FORBIDDEN'
  | 'TEAM_OFFICE_REQUIRED'
  | 'TEAM_TARGET_FORBIDDEN'
  | 'TEAM_FIELD_FORBIDDEN'

export interface TeamDenial {
  ok: false
  code: TeamCode
  message: string
}
export interface TeamAllowed {
  ok: true
  role: TeamRole
  offices: string[]
}
export type TeamResult = TeamAllowed | TeamDenial

/** What a check needs to know about an account. Offices may arrive in any case or spacing. */
export interface Account {
  role?: unknown
  offices?: unknown
  name?: unknown
  email?: unknown
}
/** What a request asks to write. Fields that are absent are left as they are. */
export interface Change extends Account {
  password?: unknown
}

export const isTeamRole = (v: unknown): v is TeamRole =>
  typeof v === 'string' && (TEAM_ROLES as readonly string[]).includes(v)

const deny = (code: TeamCode, message: string): TeamDenial => ({ ok: false, code, message })

export function officesOf(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.map(normalizeOffice).filter(Boolean))] : []
}

/** The offices a person manages: an Approver's own. Nobody else manages anyone. */
export function teamOffices(actor: Actor): string[] {
  return actor.kind === 'user' && actor.role === 'approver' ? actor.offices : []
}
export const managesTeam = (actor: Actor): boolean => teamOffices(actor).length > 0

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
const same = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((x) => b.includes(x))

/** A new account. Missing role means Contributor (the field default); a lone office is filled in. */
export function checkTeamCreate(actor: Actor, data: Change): TeamResult {
  const scope = teamOffices(actor)
  if (scope.length === 0)
    return deny('TEAM_TARGET_FORBIDDEN', 'You do not hold an office, so you cannot add people.')

  const role = data.role ?? 'contributor'
  if (!isTeamRole(role))
    return deny(
      'TEAM_ROLE_FORBIDDEN',
      'You can add Editors and Contributors only. Other roles are given by the IT Directorate.',
    )

  const asked = officesOf(data.offices)
  const offices = asked.length > 0 ? asked : scope.length === 1 ? scope : []
  if (offices.length === 0)
    return deny('TEAM_OFFICE_REQUIRED', 'Choose which of your offices the new person works for.')
  if (offices.some((o) => !scope.includes(o)))
    return deny('TEAM_OFFICE_FORBIDDEN', 'You can only give the offices you hold yourself.')
  return { ok: true, role, offices }
}

/** Is this person on the approver's team? Their role is a team role and they share an office. */
export function onTeam(actor: Actor, account: Account): boolean {
  const scope = teamOffices(actor)
  return isTeamRole(account.role) && officesOf(account.offices).some((o) => scope.includes(o))
}

/** A change to someone else's account. `original` is what is stored, `data` what is being saved. */
export function checkTeamUpdate(actor: Actor, original: Account, data: Change): TeamResult {
  const scope = teamOffices(actor)
  if (!onTeam(actor, original) || !isTeamRole(original.role))
    return deny(
      'TEAM_TARGET_FORBIDDEN',
      'You can manage Editors and Contributors who work for one of your offices, and no one else.',
    )

  if (data.password)
    return deny(
      'TEAM_FIELD_FORBIDDEN',
      'Only the IT Directorate sets or resets another person’s password.',
    )
  if (
    data.email !== undefined &&
    text(data.email).toLowerCase() !== text(original.email).toLowerCase()
  )
    return deny('TEAM_FIELD_FORBIDDEN', 'Only the IT Directorate changes a person’s email address.')
  if (data.name !== undefined && text(data.name) !== text(original.name))
    return deny('TEAM_FIELD_FORBIDDEN', 'Only the IT Directorate changes a person’s name.')

  const role = data.role ?? original.role
  if (!isTeamRole(role))
    return deny(
      'TEAM_ROLE_FORBIDDEN',
      'You can make someone an Editor or a Contributor, nothing else.',
    )

  const before = officesOf(original.offices)
  const after = data.offices === undefined ? before : officesOf(data.offices)
  // Offices that are not yours must come out exactly as they went in; whatever you add is yours.
  if (
    !same(
      before.filter((o) => !scope.includes(o)),
      after.filter((o) => !scope.includes(o)),
    )
  )
    return deny(
      'TEAM_OFFICE_FORBIDDEN',
      'You can only give or take away the offices you hold yourself.',
    )
  if (after.length === 0)
    return deny(
      'TEAM_OFFICE_REQUIRED',
      'A person needs at least one office. To remove someone completely, delete the account.',
    )
  return { ok: true, role, offices: after }
}

/** Deleting an account: only a team member who works for none but the approver's offices. */
export function checkTeamDelete(actor: Actor, original: Account): TeamDenial | null {
  const scope = teamOffices(actor)
  if (!onTeam(actor, original))
    return deny(
      'TEAM_TARGET_FORBIDDEN',
      'You can delete Editors and Contributors who work for one of your offices, and no one else.',
    )
  if (officesOf(original.offices).some((o) => !scope.includes(o)))
    return deny(
      'TEAM_TARGET_FORBIDDEN',
      'This person also works for another office. Take your office off their account instead.',
    )
  return null
}
