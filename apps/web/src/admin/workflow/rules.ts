/**
 * What a person sees on a document screen, decided from their role and the item's stage (slice 3aa).
 *
 * Pure: no React, no Payload. It only asks the same functions the save hook uses (policy.ts), so the
 * screen can never offer a button the policy would refuse for a role reason. The policy stays the
 * only authority: pressing a button just sets the Stage and saves, and every hook still runs.
 */

import { canSubmitFor, inScope, isReviewerFor } from '../../governance/policy'
import {
  normalizeOffice,
  WORKFLOW_LABELS,
  type Actor,
  type RiskClass,
  type VerificationStatus,
  type WorkflowStatus,
} from '../../governance/roles'

export type StepAction = 'sendForReview' | 'approve' | 'sendBack' | 'markVerified'
export type Words = { en: string; ur: string }

export interface WorkflowInput {
  actor: Actor
  stage: WorkflowStatus
  verification: VerificationStatus
  risk: RiskClass
  ownerOffice: string | null
  /** The document has been saved at least once. */
  saved: boolean
  /** Created by the signed-in person (matters for contributors). */
  mine: boolean
}

export type Tone = 'info' | 'waiting' | 'ready' | 'readonly'

export interface WorkflowView {
  tone: Tone
  banner: Words
  actions: StepAction[]
  /** Payload's Publish button. Reviewers only, and only once the item is Approved (or already live). */
  showPublish: boolean
  /** Payload's Save Draft button. */
  showSave: boolean
}

const w = (en: string, ur: string): Words => ({ en, ur })

/** Offices are stored lower-case; show them the way people write them. */
const office = (o: string | null): string =>
  o ? o.replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : 'the owning office'

/** The first step an approver takes on a draft: approve straight away, or ask for a second pair of eyes. */
export function workflowView(input: WorkflowInput): WorkflowView {
  const { actor, stage, verification, risk, ownerOffice, saved, mine } = input

  if (actor.kind !== 'user' || actor.role === 'auditor') {
    return {
      tone: 'readonly',
      banner: w(
        `Read only. This item is ${WORKFLOW_LABELS[stage]}. Your role can look but not change it.`,
        'صرف پڑھنے کے لیے۔ آپ کا کردار اسے دیکھ سکتا ہے، بدل نہیں سکتا۔',
      ),
      actions: [],
      showPublish: false,
      showSave: false,
    }
  }

  const scope = { ownerOffice: normalizeOffice(ownerOffice) || null, risk }
  const reviewer = isReviewerFor(actor, scope)
  const submitter = canSubmitFor(actor, scope)
  const role = actor.role
  const outOfOffice =
    (role === 'editor' || role === 'approver') && saved && !inScope(actor, scope.ownerOffice)

  if (outOfOffice) {
    return {
      tone: 'readonly',
      banner: w(
        `This item belongs to ${office(ownerOffice)}, not to your office. You can look but not change it.`,
        'یہ آئٹم آپ کے دفتر کا نہیں ہے۔ آپ اسے دیکھ سکتے ہیں، بدل نہیں سکتے۔',
      ),
      actions: [],
      showPublish: false,
      showSave: false,
    }
  }

  const unverified = verification !== 'verified'
  const verify: StepAction[] = reviewer && unverified ? ['markVerified'] : []

  if (!saved) {
    return {
      tone: 'info',
      banner: w(
        'New item. Fill it in and press Save Draft. After it is saved you can send it for review.',
        'نیا آئٹم۔ اسے بھریں اور مسودہ محفوظ کریں دبائیں۔ محفوظ ہونے کے بعد آپ اسے جائزے کے لیے بھیج سکتے ہیں۔',
      ),
      actions: [],
      showPublish: false,
      showSave: true,
    }
  }

  if (role === 'contributor') {
    if (stage === 'draft' && mine) {
      return {
        tone: 'info',
        banner: w(
          `Your draft. Press Save Draft to keep it. Contributors cannot send items for review: ask an editor of ${office(ownerOffice)} to send it.`,
          'آپ کا مسودہ۔ اسے رکھنے کے لیے مسودہ محفوظ کریں دبائیں۔ معاونین جائزے کے لیے نہیں بھیج سکتے: اپنے دفتر کے ایڈیٹر سے کہیں۔',
        ),
        actions: [],
        showPublish: false,
        showSave: true,
      }
    }
    return {
      tone: 'readonly',
      banner: w(
        `This item is ${WORKFLOW_LABELS[stage]}. Contributors can only change their own drafts.`,
        'یہ آئٹم اب آپ کے مسودے کے مرحلے میں نہیں۔ معاونین صرف اپنے مسودے بدل سکتے ہیں۔',
      ),
      actions: [],
      showPublish: false,
      showSave: false,
    }
  }

  // Editors, approvers, site managers and platform admins from here on.
  switch (stage) {
    case 'draft':
      if (reviewer) {
        return {
          tone: 'info',
          banner: w(
            'Draft. Save it, then approve it yourself or send it for a second review.',
            'مسودہ۔ اسے محفوظ کریں، پھر خود منظور کریں یا دوسرے جائزے کے لیے بھیجیں۔',
          ),
          actions: ['approve', 'sendForReview', ...verify],
          showPublish: false,
          showSave: true,
        }
      }
      return {
        tone: 'info',
        banner: w(
          `Draft. Press Save Draft to keep your changes, then Send for review when it is ready. Your ${office(ownerOffice)} approver will see it under Waiting for review.`,
          'مسودہ۔ تبدیلیاں رکھنے کے لیے مسودہ محفوظ کریں دبائیں، تیار ہو تو جائزے کے لیے بھیجیں۔ آپ کے دفتر کے منظوری دہندہ اسے "جائزے کے منتظر" میں دیکھیں گے۔',
        ),
        actions: submitter ? ['sendForReview'] : [],
        showPublish: false,
        showSave: true,
      }
    case 'in_review':
      if (reviewer) {
        return {
          tone: 'waiting',
          banner: w(
            'Waiting for your review. Approve it, or send it back to the editor with a reason.',
            'آپ کے جائزے کا منتظر۔ منظور کریں، یا وجہ کے ساتھ ایڈیٹر کو واپس بھیجیں۔',
          ),
          actions: ['approve', 'sendBack', ...verify],
          showPublish: false,
          showSave: true,
        }
      }
      return {
        tone: 'waiting',
        banner: w(
          `Sent. Waiting for the ${office(ownerOffice)} approver. If you change this item it goes back to Draft.`,
          'بھیج دیا گیا۔ دفتر کے منظوری دہندہ کا انتظار ہے۔ اگر آپ اس میں تبدیلی کریں تو یہ مسودے میں واپس چلا جائے گا۔',
        ),
        actions: [],
        showPublish: false,
        showSave: false,
      }
    case 'approved':
      if (reviewer) {
        return {
          tone: 'ready',
          banner: unverified
            ? w(
                'Approved. Before it can be published, set Fact-check to Verified (Mark verified) and make sure the source is filled in.',
                'منظور شدہ۔ شائع کرنے سے پہلے حقائق کی جانچ کو تصدیق شدہ کریں اور ماخذ بھریں۔',
              )
            : w(
                'Approved and verified. Press Publish to put it on the website.',
                'منظور اور تصدیق شدہ۔ ویب سائٹ پر لانے کے لیے شائع کریں دبائیں۔',
              ),
          actions: ['sendBack', ...verify],
          showPublish: true,
          showSave: true,
        }
      }
      return {
        tone: 'waiting',
        banner: w(
          'Approved. Waiting for an approver to publish it. If you change this item it goes back to Draft.',
          'منظور شدہ۔ شائع کرنے کے لیے منظوری دہندہ کا انتظار ہے۔ تبدیلی کی تو یہ مسودے میں واپس چلا جائے گا۔',
        ),
        actions: [],
        showPublish: false,
        showSave: false,
      }
    case 'published':
      if (reviewer) {
        return {
          tone: 'ready',
          banner: w(
            'Live on the website. Changes are saved as a new draft first; Publish changes puts them live.',
            'ویب سائٹ پر شائع ہے۔ تبدیلیاں پہلے نئے مسودے کے طور پر محفوظ ہوتی ہیں؛ شائع کریں دبانے پر لائیو ہوتی ہیں۔',
          ),
          actions: verify,
          showPublish: true,
          showSave: true,
        }
      }
      return {
        tone: 'info',
        banner: w(
          'Live on the website. Your changes are saved as a draft and must be approved before they go live.',
          'ویب سائٹ پر شائع ہے۔ آپ کی تبدیلیاں مسودے کے طور پر محفوظ ہوں گی اور لائیو ہونے سے پہلے منظور ہونی چاہئیں۔',
        ),
        actions: [],
        showPublish: false,
        showSave: true,
      }
    case 'archived':
    default:
      return {
        tone: 'readonly',
        banner: w(
          'Archived. It is no longer shown on the website. Only an approver or a platform admin can restore it.',
          'آرکائیو شدہ۔ یہ اب ویب سائٹ پر نہیں دکھتا۔ صرف منظوری دہندہ یا پلیٹ فارم ایڈمن اسے بحال کر سکتا ہے۔',
        ),
        actions: [],
        showPublish: false,
        showSave: false,
      }
  }
}

/** The Stage each step button asks for. The policy decides whether the save is allowed. */
export const STEP_TARGET: Record<Exclude<StepAction, 'markVerified'>, WorkflowStatus> = {
  sendForReview: 'in_review',
  approve: 'approved',
  sendBack: 'draft',
}

export const STEP_LABEL: Record<StepAction, Words> = {
  sendForReview: w('Send for review', 'جائزے کے لیے بھیجیں'),
  approve: w('Approve', 'منظور کریں'),
  sendBack: w('Send back', 'واپس بھیجیں'),
  markVerified: w('Mark verified', 'تصدیق شدہ کریں'),
}

/** What the banner says right after a step succeeded. */
export const STEP_DONE: Record<StepAction, Words> = {
  sendForReview: w(
    'Sent. Your approver sees it under Waiting for review.',
    'بھیج دیا گیا۔ منظوری دہندہ اسے "جائزے کے منتظر" میں دیکھے گا۔',
  ),
  approve: w('Approved. An approver can now publish it.', 'منظور ہو گیا۔ اب منظوری دہندہ اسے شائع کر سکتا ہے۔'),
  sendBack: w('Sent back to Draft. The editor can change it and send it again.', 'مسودے میں واپس بھیج دیا گیا۔'),
  markVerified: w('Marked as verified.', 'تصدیق شدہ نشان زد ہو گیا۔'),
}
