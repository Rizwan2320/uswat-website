/**
 * Roles, workflow states and the actor model (plan v2 section 7.3, Addendum section 7).
 * Pure module: no Payload imports, so the policy built on it is unit-tested without a database.
 */

export const ROLES = [
  'platformAdmin',
  'siteManager',
  'approver',
  'editor',
  'contributor',
  'auditor',
] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  platformAdmin: 'Platform Admin (IT Directorate)',
  siteManager: 'Site Manager (central web office)',
  approver: 'Approver (head of an office)',
  editor: 'Editor (department staff)',
  contributor: 'Contributor (any staff, drafts only)',
  auditor: 'Auditor (read only)',
}

export const WORKFLOW_STATUSES = ['draft', 'in_review', 'approved', 'published', 'archived'] as const
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number]

export const WORKFLOW_LABELS: Record<WorkflowStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
}

export const VERIFICATION_STATUSES = ['unverified', 'verified', 'stale'] as const
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]

export const RISK_CLASSES = ['low', 'standard', 'high_impact'] as const
export type RiskClass = (typeof RISK_CLASSES)[number]
export const RISK_RANK: Record<RiskClass, number> = { low: 0, standard: 1, high_impact: 2 }

export const ORIGINS = ['editor', 'importer', 'watcher'] as const
export type Origin = (typeof ORIGINS)[number]

export type Id = string | number

/**
 * Who is acting.
 * - `user`: a signed-in person.
 * - `system`: trusted server code (Local API with no user): jobs, importer, scripts.
 * - `anonymous`: a REST or GraphQL request with no user. Never allowed to write.
 */
export type Actor =
  | { kind: 'user'; id: Id; role: Role; offices: string[] }
  | { kind: 'system' }
  | { kind: 'anonymous' }

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

interface UserLike {
  id?: Id
  role?: unknown
  offices?: unknown
}

/**
 * A user without a valid role gets the least privileged one. Stale or legacy accounts
 * must never fall through to more access than a contributor.
 */
export function actorFromUser(user: UserLike): Actor {
  const offices = Array.isArray(user.offices)
    ? user.offices.filter((o): o is string => typeof o === 'string' && o.length > 0)
    : []
  return {
    kind: 'user',
    id: user.id as Id,
    role: isRole(user.role) ? user.role : 'contributor',
    offices,
  }
}

/** `payloadAPI` is 'local', 'REST' or 'GraphQL' on a Payload request. */
export function actorFromRequest(req: {
  user?: UserLike | null
  payloadAPI?: string
}): Actor {
  if (req.user) return actorFromUser(req.user)
  return req.payloadAPI === 'local' ? { kind: 'system' } : { kind: 'anonymous' }
}
