/**
 * "You are..." (slice 3ai): one plain sentence per role, shown on every admin screen, so nobody
 * has to guess what they may do. Pure, so it is unit-tested; English and Urdu.
 * The Urdu lines are drafts for a native reader to check.
 */

import type { Actor } from './roles'

export interface Words {
  en: string
  ur: string
}

export interface WhoAmI {
  /** "You are the Platform Admin" */
  title: Words
  /** What this person does, and what they do not. */
  detail: Words
  /** Drives the colour only. */
  kind: 'admin' | 'manager' | 'head' | 'coordinator' | 'editor' | 'contributor' | 'auditor'
}

const w = (en: string, ur: string): Words => ({ en, ur })

const list = (names: string[]): string => names.join(', ')

/**
 * @param programmeNames names of the programmes a coordinator looks after (looked up by the caller;
 *   empty when they could not be read, in which case the count is shown instead).
 */
export function whoAmI(actor: Actor, programmeNames: string[] = []): WhoAmI {
  if (actor.kind !== 'user') {
    return {
      kind: 'auditor',
      title: w('You are signed in', 'آپ سائن ان ہیں'),
      detail: w('This account cannot change anything.', 'یہ اکاؤنٹ کچھ نہیں بدل سکتا۔'),
    }
  }
  const offices = list(actor.offices)
  switch (actor.role) {
    case 'platformAdmin':
      return {
        kind: 'admin',
        title: w('You are the Platform Admin', 'آپ پلیٹ فارم ایڈمن ہیں'),
        detail: w(
          'You run the whole site. You write and publish the landing page and the other main pages yourself, you create departments, and you create the accounts of heads of department. No one reviews you; every step is kept in the audit log.',
          'آپ پوری سائٹ چلاتے ہیں۔ ہوم پیج اور دوسرے مرکزی صفحات آپ خود لکھتے اور شائع کرتے ہیں، شعبے بناتے ہیں، اور شعبوں کے سربراہوں کے اکاؤنٹ بناتے ہیں۔ آپ کو کوئی نہیں جانچتا؛ ہر قدم آڈٹ لاگ میں رہتا ہے۔',
        ),
      }
    case 'siteManager':
      return {
        kind: 'manager',
        title: w('You are a Site Manager', 'آپ سائٹ مینیجر ہیں'),
        detail: w(
          'You review and publish content across the whole site, except items marked High impact. You cannot approve your own work: another approver does.',
          'آپ پوری سائٹ کا مواد جانچتے اور شائع کرتے ہیں، سوائے "بہت اہم" آئٹمز کے۔ اپنا کام خود منظور نہیں کر سکتے: دوسرا منظوری دہندہ کرتا ہے۔',
        ),
      }
    case 'approver':
      return {
        kind: 'head',
        title: offices
          ? w(`You are the head of ${offices}`, `آپ ${offices} کے سربراہ ہیں`)
          : w('You are an Approver', 'آپ منظوری دہندہ ہیں'),
        detail: w(
          'You review what your coordinators and editors send you, and you publish. For your own department page and its programme pages you publish yourself, with no one else reviewing. You add programmes to your department and create accounts for your coordinators and editors. You cannot change main pages or other offices.',
          'آپ اپنے کوآرڈینیٹرز اور ایڈیٹرز کا بھیجا ہوا جانچتے اور شائع کرتے ہیں۔ اپنے شعبے کا صفحہ اور اس کے پروگرام کے صفحات آپ خود شائع کرتے ہیں، کسی اور کی جانچ کے بغیر۔ اپنے شعبے میں نئے پروگرام اور اپنے کوآرڈینیٹرز اور ایڈیٹرز کے اکاؤنٹ آپ بناتے ہیں۔ مرکزی صفحات اور دوسرے دفاتر کو آپ نہیں بدل سکتے۔',
        ),
      }
    case 'editor': {
      const n = actor.programmes?.length ?? 0
      if (n > 0) {
        const names = programmeNames.length > 0 ? list(programmeNames) : `${n}`
        return {
          kind: 'coordinator',
          title: w(
            programmeNames.length > 0
              ? `You are the coordinator of ${names}`
              : `You are a programme coordinator (${n} programme${n === 1 ? '' : 's'})`,
            programmeNames.length > 0
              ? `آپ ${names} کے کوآرڈینیٹر ہیں`
              : `آپ پروگرام کوآرڈینیٹر ہیں (${n})`,
          ),
          detail: w(
            'You write drafts for your own programme page only and send them to your head of department. When the head approves and verifies it, the Publish button appears here and you publish it.',
            'آپ صرف اپنے پروگرام کے صفحے کے مسودے لکھتے ہیں اور شعبے کے سربراہ کو بھیجتے ہیں۔ جب سربراہ منظور اور تصدیق کر دے تو شائع کریں کا بٹن یہاں آ جاتا ہے اور آپ شائع کرتے ہیں۔',
          ),
        }
      }
      return {
        kind: 'editor',
        title: offices
          ? w(`You are an Editor of ${offices}`, `آپ ${offices} کے ایڈیٹر ہیں`)
          : w('You are an Editor', 'آپ ایڈیٹر ہیں'),
        detail: w(
          'You write drafts and send them to your head of office for approval. You cannot publish.',
          'آپ مسودے لکھتے ہیں اور منظوری کے لیے دفتر کے سربراہ کو بھیجتے ہیں۔ آپ شائع نہیں کر سکتے۔',
        ),
      }
    }
    case 'contributor':
      return {
        kind: 'contributor',
        title: w('You are a Contributor', 'آپ معاون ہیں'),
        detail: w(
          'You write drafts only. An editor of your office sends them for review.',
          'آپ صرف مسودے لکھتے ہیں۔ آپ کے دفتر کا ایڈیٹر انہیں جائزے کے لیے بھیجتا ہے۔',
        ),
      }
    default:
      return {
        kind: 'auditor',
        title: w('You are an Auditor', 'آپ آڈیٹر ہیں'),
        detail: w(
          'You can read everything, including the audit log, but you cannot change anything.',
          'آپ آڈٹ لاگ سمیت سب کچھ پڑھ سکتے ہیں، لیکن کچھ بدل نہیں سکتے۔',
        ),
      }
  }
}
