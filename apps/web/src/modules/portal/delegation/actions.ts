'use server'
/** The delegation actions. None takes a `forId`: a delegate cannot grant, revoke or read anyone's delegation. */
import { delegationService } from './wiring'
import type { GrantResult } from './service'

const PATH = '/portal/delegation'
export async function grantDelegation(input: unknown): Promise<GrantResult> {
  return delegationService(PATH).grant(input)
}
export async function revokeDelegation(id: unknown): Promise<{ ok: boolean; error?: 'session' | 'nothing' }> {
  return delegationService(PATH).revoke(id)
}
