/** Activation of a claimed account by the department head (FP-01, section 5.6). Shapes only. */
export type ActivationDecision = 'activated' | 'declined'
export const ACTIVATION_DECISIONS: readonly ActivationDecision[] = ['activated', 'declined']

export type PendingItem = { subjectId: string; name: string; email: string; claimedAt: number; recordRef: string | null }
export type ActivationInput = { subjectId: string; decision: ActivationDecision }
/** 'forbidden': not a head, other department, oneself, or unknown (never told apart). 'stale': no longer waiting, or no second factor yet. */
export type ActivationOutcome = 'ok' | 'forbidden' | 'stale'

export interface ActivationStore {
  isHead(userId: string): Promise<boolean>
  listPending(headId: string): Promise<PendingItem[]>
  decide(headId: string, input: ActivationInput, now: number): Promise<ActivationOutcome>
}
