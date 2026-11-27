import { describe, expect, it } from 'vitest'

import {
  chips,
  isUnset,
  options,
  PICKER_COPY,
  withOffice,
  withoutOffice,
  type KnownOffice,
} from '../../src/admin/OfficePicker/rules'

const depts: KnownOffice[] = [
  { office: 'department of physics', name: 'Department of Physics', kind: 'department' },
  { office: 'department of chemistry', name: 'Department of Chemistry', kind: 'department' },
  { office: 'it directorate', name: 'Department of Unset', kind: 'department' },
  { office: '', name: 'Department of Empty', kind: 'department' },
]

describe('office picker rules (slice 3aq)', () => {
  it('the empty office and the admin placeholder count as unset', () => {
    expect(isUnset('')).toBe(true)
    expect(isUnset('  IT Directorate ')).toBe(true)
    expect(isUnset(null)).toBe(true)
    expect(isUnset('Department of Physics')).toBe(false)
  })

  it('the admin is offered every department, the unset ones listed but not addable', () => {
    const o = options(depts, [], { role: 'platformAdmin', offices: [] })
    expect(o.map((x) => x.name)).toEqual([
      'Department of Physics',
      'Department of Chemistry',
      'Department of Unset',
      'Department of Empty',
    ])
    expect(o.filter((x) => x.disabledReason).map((x) => x.name)).toEqual([
      'Department of Unset',
      'Department of Empty',
    ])
    expect(o[0]?.office).toBe('department of physics')
  })

  it('a department already on the account is not offered again', () => {
    const o = options(depts, ['Department of Physics'], { role: 'platformAdmin', offices: [] })
    expect(o.map((x) => x.name)).not.toContain('Department of Physics')
  })

  it('a head sees only departments of their own office, never the unset ones', () => {
    const o = options(depts, [], { role: 'approver', offices: ['department of physics'] })
    expect(o.map((x) => x.name)).toEqual(['Department of Physics'])
  })

  it('a head with the placeholder office is offered nothing unset', () => {
    const o = options(depts, [], { role: 'approver', offices: ['it directorate'] })
    expect(o).toEqual([])
  })

  it('shows what each office matches, and flags one that matches nothing', () => {
    const c = chips(['department of physics', 'fyzics'], depts)
    expect(c[0]?.known?.name).toBe('Department of Physics')
    expect(c[1]?.known).toBeNull()
  })

  it('adds and removes lower-case words without duplicates or empties', () => {
    expect(withOffice([], ' Department Of Physics ')).toEqual(['department of physics'])
    expect(withOffice(['department of physics'], 'DEPARTMENT OF PHYSICS')).toEqual(['department of physics'])
    expect(withOffice(['a'], '   ')).toEqual(['a'])
    expect(withoutOffice(['a', 'b'], 'A')).toEqual(['b'])
  })

  it('every line has English and Urdu', () => {
    for (const v of Object.values(PICKER_COPY)) {
      expect(v.en.length).toBeGreaterThan(0)
      expect(v.ur.length).toBeGreaterThan(0)
    }
  })
})
