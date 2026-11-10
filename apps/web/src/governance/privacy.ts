import type { FieldAccess } from 'payload'

/**
 * Per-field visibility for personal details (Addendum C FP-06, FP reply 2026-11-10).
 *
 * A person's own `visibility.<field>` says who may see that field through the API:
 * - `public`: everyone;
 * - `internal`: signed-in staff only;
 * - `hidden` (the default): signed-in staff only, and never shown by any public listing.
 *
 * Staff need the values to edit the record, so signed-in users (and server code with
 * `overrideAccess`) always see them. A read that carries no `visibility` (for example one that
 * selected only the email) fails closed.
 */
export type PersonalField = 'email' | 'photo'

export const visibleWhenPublic =
  (field: PersonalField): FieldAccess =>
  ({ req, doc }) => {
    if (req.user) return true
    const v = (doc as { visibility?: Record<string, unknown> } | undefined)?.visibility?.[field]
    return v === 'public'
  }
