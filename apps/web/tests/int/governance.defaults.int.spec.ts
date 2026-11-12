// @vitest-environment node
/** The admin's first automatic draft save carries no office, so the field must default to one. */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload } from '../helpers/governance'

let payload: Payload

type Default = (a: { user?: unknown }) => unknown
function ownerOfficeDefault(slug: string): Default {
  const col = payload.collections[slug as 'pages'].config
  const gov = col.fields.find((f) => 'name' in f && f.name === 'governance') as {
    fields: { name: string; defaultValue?: unknown }[]
  }
  return gov.fields.find((f) => f.name === 'ownerOffice')!.defaultValue as Default
}

describe('owner office default', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it.each(['pages', 'notices', 'events', 'people', 'offices'])(
    'starts %s with the first office of the person creating it',
    (slug) => {
      const d = ownerOfficeDefault(slug)
      expect(d({ user: { offices: ['registrar'] } })).toBe('registrar')
      expect(d({ user: { offices: ['finance', 'registrar'] } })).toBe('finance')
    },
  )

  it('is empty for a person with no office, and for no user', () => {
    const d = ownerOfficeDefault('notices')
    expect(d({ user: { offices: [] } })).toBeUndefined()
    expect(d({ user: {} })).toBeUndefined()
    expect(d({ user: null })).toBeUndefined()
    expect(d({})).toBeUndefined()
  })
})
