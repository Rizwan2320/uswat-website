'use server'
/** The notifications action. It takes no account id: the account is the signed-in person's, from the full page guard. */
import { notificationService } from './wiring'
import type { SaveResult } from './service'

export async function saveCadence(input: unknown): Promise<SaveResult> {
  return notificationService('/portal/notifications').setCadence(input)
}
