import type { CollectionBeforeValidateHook } from 'payload'

import { ADMIN_DEFAULT_OFFICE } from '../../governance/fields'
import { normalizeOffice } from '../../governance/roles'

/**
 * A department owns itself (slice 3aq). A new department made by the platform admin starts with the
 * admin's own office, "IT Directorate" (governance/fields.ts), and a head given that office would be
 * handed the admin's pages. So when a department's owner office is empty or still that placeholder, the
 * department's English name becomes its owner office, and the account form can offer the department by
 * name without anyone retyping an office.
 *
 * Only the empty or placeholder case is touched: a department with a real office keeps it, and a
 * later rename never changes it, so the accounts that matched it keep matching. It never throws:
 * Payload also runs this hook while it builds the empty Create screen (slice 3ap).
 */
export const departmentOwnsItself: CollectionBeforeValidateHook = ({ data, originalDoc, req }) => {
  if (!data) return data
  // The English name is the office word. A save in another language does not decide it.
  if (req.locale && req.locale !== 'en') return data
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  if (name === '') return data
  const gov = (data.governance as Record<string, unknown> | undefined) ?? {}
  const current =
    typeof gov.ownerOffice === 'string'
      ? gov.ownerOffice
      : (originalDoc as { governance?: { ownerOffice?: unknown } } | undefined)?.governance
          ?.ownerOffice
  const now = normalizeOffice(typeof current === 'string' ? current : '')
  if (now !== '' && now !== normalizeOffice(ADMIN_DEFAULT_OFFICE)) return data
  data.governance = { ...gov, ownerOffice: name }
  return data
}
