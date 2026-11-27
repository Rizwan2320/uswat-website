/**
 * A programme belongs to its department's office (slice 3ah): nobody types the owner office of a
 * programme. The head of the department (an Approver whose office is the department) then sees and
 * reviews every programme under it, and a coordinator is limited to their own programmes separately
 * (`users.programmes`). A programme without a department keeps the office it has.
 */
import type { CollectionBeforeValidateHook } from 'payload'

type Loose = Record<string, unknown>

const idOf = (v: unknown): string | number | null => {
  if (typeof v === 'string' || typeof v === 'number') return v
  if (typeof v === 'object' && v !== null && 'id' in v) return idOf((v as Loose).id)
  return null
}

export const inheritDepartmentOffice: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data
  const id = idOf(data.department ?? originalDoc?.department)
  if (id === null) return data
  const dept = (await req.payload
    .findByID({
      collection: 'departments',
      id,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })
    .catch(() => null)) as { governance?: { ownerOffice?: unknown } } | null
  const office = dept?.governance?.ownerOffice
  if (typeof office === 'string' && office.trim().length > 0) {
    data.governance = { ...((data.governance as Loose | undefined) ?? {}), ownerOffice: office }
  }
  return data
}
