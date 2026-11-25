/**
 * "You are editing ..." (slice 3aq): one plain line above the status box saying which page this is and
 * why this person may change it. Pure, like rules.ts, so it is unit-tested without a browser.
 *
 * A page outside the person's reach gets no line here: the status box already says "you can look but not
 * change it". English and Urdu; the Urdu lines are drafts for a native reader to check.
 */

import { inScope } from '../../governance/policy'
import { normalizeOffice, type Actor } from '../../governance/roles'

import type { Words } from './rules'

export interface YouAreInput {
  actor: Actor
  collection?: string
  id?: string | number | null
  /** The page's title as the screen shows it; empty for a page that has none yet. */
  title?: string
  ownerOffice: string | null
  /** Saved at least once; false on a new page that has not been saved. */
  saved: boolean
}

const w = (en: string, ur: string): Words => ({ en, ur })

const KIND: Record<string, Words> = {
  departments: w('department page', 'شعبے کا صفحہ'),
  programmes: w('programme page', 'پروگرام کا صفحہ'),
}
const kindOf = (collection?: string): Words =>
  (collection && KIND[collection]) || w('page', 'صفحہ')

/** `: Title` when there is a real title. */
const named = (title: string | undefined): string => {
  const t = (title ?? '').trim()
  return t === '' || t.toLowerCase() === '[untitled]' || t.toLowerCase() === 'untitled' ? '' : t
}

export function youAreLine(i: YouAreInput): Words | null {
  const { actor, collection } = i
  if (actor.kind !== 'user' || actor.role === 'auditor') return null
  const t = named(i.title)
  const kind = kindOf(collection)
  const office = normalizeOffice(i.ownerOffice ?? '') || null
  const myOffice = actor.offices.length > 0 ? actor.offices.join(', ') : null

  if (!i.saved) {
    return actor.role === 'platformAdmin' || !myOffice
      ? w(`You are creating a new ${kind.en}.`, `آپ نیا ${kind.ur} بنا رہے ہیں۔`)
      : w(
          `You are creating a new ${kind.en} for your office, ${myOffice}.`,
          `آپ اپنے دفتر ${myOffice} کے لیے نیا ${kind.ur} بنا رہے ہیں۔`,
        )
  }

  const target = collection ? { collection, id: i.id ?? null } : undefined
  if (!inScope(actor, office, target)) return null

  const en = (s: string) => (t ? `${s} ${t}.` : `${s.replace(/:$/, '')}.`)
  const ur = (s: string) => (t ? `${s} ${t}۔` : `${s.replace(/:$/, '')}۔`)

  if (actor.role === 'platformAdmin')
    return w(
      en(`You are editing the ${kind.en} as the platform admin:`),
      ur(`آپ پلیٹ فارم ایڈمن کی حیثیت سے ${kind.ur} بدل رہے ہیں:`),
    )
  if (actor.role === 'siteManager')
    return w(
      en(`You are editing the ${kind.en} as a site manager, who may change every office's pages:`),
      ur(`آپ سائٹ مینیجر کی حیثیت سے ${kind.ur} بدل رہے ہیں:`),
    )
  if (actor.role === 'editor' && (actor.programmes?.length ?? 0) > 0)
    return w(
      en('You are editing a programme you coordinate:'),
      ur('آپ اپنے زیرِ نگرانی پروگرام کو بدل رہے ہیں:'),
    )
  if (actor.role === 'approver' && collection === 'departments')
    return w(en('This is your department page:'), ur('یہ آپ کے شعبے کا صفحہ ہے:'))
  if (actor.role === 'approver' && collection === 'programmes')
    return w(
      en('This is a programme of your department:'),
      ur('یہ آپ کے شعبے کا ایک پروگرام ہے:'),
    )
  return w(
    en(`This ${kind.en} belongs to your office, ${office ?? myOffice ?? ''}:`),
    ur(`یہ ${kind.ur} آپ کے دفتر ${office ?? myOffice ?? ''} کا ہے:`),
  )
}
