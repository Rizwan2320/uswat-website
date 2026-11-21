/** Notification kinds (FP-43). Names only; the words people read live in copy.ts. */
export const SECURITY_KINDS = ['passkey-added', 'passkey-removed', 'recovery-codes-issued', 'sign-in-recovery', 'sign-out-everywhere', 'delegation-given'] as const
export const DIGEST_KINDS = ['profile-approved', 'profile-returned', 'account-confirmed', 'works-found', 'delegation-received', 'delegation-ended', 'delegate-activity', 'review-waiting'] as const
export type SecurityKind = (typeof SECURITY_KINDS)[number]
export type DigestKind = (typeof DIGEST_KINDS)[number]
export type NoticeKind = SecurityKind | DigestKind
export const ALL_KINDS: readonly NoticeKind[] = [...SECURITY_KINDS, ...DIGEST_KINDS]
export const isNoticeKind = (v: unknown): v is NoticeKind => typeof v === 'string' && (ALL_KINDS as readonly string[]).includes(v)
export const isSecurityKind = (v: unknown): v is SecurityKind => typeof v === 'string' && (SECURITY_KINDS as readonly string[]).includes(v)

export const CADENCES = ['daily', 'weekly', 'off'] as const
export type Cadence = (typeof CADENCES)[number]
export const DEFAULT_CADENCE: Cadence = 'daily'
export const isCadence = (v: unknown): v is Cadence => typeof v === 'string' && (CADENCES as readonly string[]).includes(v)

export const HOUR = 3_600_000
/** One digest per person per period. */
export const PERIOD_MS: Record<Exclude<Cadence, 'off'>, number> = { daily: 24 * HOUR, weekly: 7 * 24 * HOUR }
export const LOG_PAGE = 30
