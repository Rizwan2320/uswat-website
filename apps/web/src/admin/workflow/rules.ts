/**
 * What a person sees on a document screen, decided from their role and the item's stage (slice 3aa).
 *
 * Pure: no React, no Payload. It only asks the same functions the save hook uses (policy.ts), so the
 * screen can never offer a button the policy would refuse for a role reason. The policy stays the
 * only authority: pressing a button just sets the Stage and saves, and every hook still runs.
 */

import {
  canSubmitFor,
  inScope,
  isReviewerFor,
  mayApproveOwn,
  mayPublishApproved,
  mayTakeOffline,
  type Target,
} from '../../governance/policy'
import {
  normalizeOffice,
  WORKFLOW_LABELS,
  type Actor,
  type RiskClass,
  type VerificationStatus,
  type WorkflowStatus,
} from '../../governance/roles'

export type StepAction =
  'sendForReview' | 'approve' | 'approveAndPublish' | 'sendBack' | 'markVerified' | 'takeOffline'
export type Words = { en: string; ur: string }

/** Who wrote the item, as far as the signed-in person is concerned. */
export type Author = 'me' | 'other' | 'import'

export interface WorkflowInput {
  actor: Actor
  stage: WorkflowStatus
  verification: VerificationStatus
  risk: RiskClass
  ownerOffice: string | null
  /** The document has been saved at least once. */
  saved: boolean
  /** Created by the signed-in person, by someone else, or brought in by the importer (no author). */
  author: Author
  /** Which record this is; the scope rules for pages and programme coordinators need it (slice 3ah). */
  target?: Target
}

export type Tone = 'info' | 'waiting' | 'ready' | 'readonly'

export interface WorkflowView {
  tone: Tone
  banner: Words
  actions: StepAction[]
  /** Payload's Publish button. Reviewers only, and only once the item is Approved (or already live). */
  showPublish: boolean
}

const w = (en: string, ur: string): Words => ({ en, ur })

/** Offices are stored lower-case; show them the way people write them. */
const office = (o: string | null): string =>
  o ? o.replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : 'the owning office'

const readOnly = (banner: Words): WorkflowView => ({
  tone: 'readonly',
  banner,
  actions: [],
  showPublish: false,
})

/**
 * Two rules the owner asked for (2026-11-21): a draft belongs to its author until it is sent for
 * review, and nobody approves what they wrote themselves, except that a platform admin publishes
 * their own work (2026-11-22). Both are shown here; the second is also enforced on the server
 * (policy.ts, SELF_APPROVAL).
 */
export function workflowView(input: WorkflowInput): WorkflowView {
  const { actor, stage, verification, risk, ownerOffice, saved, author, target } = input

  if (actor.kind !== 'user' || actor.role === 'auditor') {
    return readOnly(
      w(
        `Read only. This item is ${WORKFLOW_LABELS[stage]}. Your role can look but not change it.`,
        'صرف پڑھنے کے لیے۔ آپ کا کردار اسے دیکھ سکتا ہے، بدل نہیں سکتا۔',
      ),
    )
  }

  const scope = { ownerOffice: normalizeOffice(ownerOffice) || null, risk, target }
  const reviewer = isReviewerFor(actor, scope)
  const submitter = canSubmitFor(actor, scope)
  const role = actor.role
  const mine = author === 'me'
  // A platform admin publishes their own work (slice 3ag); everyone else needs a second person.
  const needsAnother = mine && !mayApproveOwn(actor, target)

  if (
    (role === 'editor' || role === 'approver') &&
    saved &&
    !inScope(actor, scope.ownerOffice, target)
  ) {
    if (role === 'editor' && ((actor as { programmes?: string[] }).programmes?.length ?? 0) > 0) {
      return readOnly(
        w(
          'You look after your own programme pages only. You can look at this one but not change it.',
          'آپ صرف اپنے پروگرام کے صفحات سنبھالتے ہیں۔ آپ اسے دیکھ سکتے ہیں، بدل نہیں سکتے۔',
        ),
      )
    }
    return readOnly(
      w(
        `This item belongs to ${office(ownerOffice)}, not to your office. You can look but not change it.`,
        'یہ آئٹم آپ کے دفتر کا نہیں ہے۔ آپ اسے دیکھ سکتے ہیں، بدل نہیں سکتے۔',
      ),
    )
  }

  const unverified = verification !== 'verified'
  const verify: StepAction[] = reviewer && unverified ? ['markVerified'] : []

  if (!saved) {
    return {
      tone: 'info',
      banner: w(
        'New item. Fill it in; it saves by itself as a draft. After the first save you can send it for review.',
        'نیا آئٹم۔ اسے بھریں؛ یہ خود بخود مسودے کے طور پر محفوظ ہوتا ہے۔ پہلی بار محفوظ ہونے کے بعد آپ اسے جائزے کے لیے بھیج سکتے ہیں۔',
      ),
      actions: [],
      showPublish: false,
    }
  }

  if (role === 'contributor') {
    if (stage === 'draft' && mine) {
      return {
        tone: 'info',
        banner: w(
          `Your draft. It saves by itself. Contributors cannot send items for review: ask an editor of ${office(ownerOffice)} to send it.`,
          'آپ کا مسودہ۔ یہ خود بخود محفوظ ہوتا ہے۔ معاونین جائزے کے لیے نہیں بھیج سکتے: اپنے دفتر کے ایڈیٹر سے کہیں۔',
        ),
        actions: [],
        showPublish: false,
      }
    }
    return readOnly(
      w(
        `This item is ${WORKFLOW_LABELS[stage]}. Contributors can only change their own drafts.`,
        'یہ آئٹم اب آپ کے مسودے کے مرحلے میں نہیں۔ معاونین صرف اپنے مسودے بدل سکتے ہیں۔',
      ),
    )
  }

  // Editors, approvers, site managers and platform admins from here on.
  switch (stage) {
    case 'draft':
      // A head of department publishes their own department's pages whoever started the draft (the
      // admin creates departments and programmes); an admin publishes what they started.
      if (
        reviewer &&
        mayApproveOwn(actor, target) &&
        author !== 'import' &&
        (mine || role === 'approver')
      ) {
        return {
          tone: 'info',
          banner: w(
            role === 'approver'
              ? 'Your draft. It saves by itself. As head of the department you publish it yourself: fill in the source of the facts, then press Approve and publish. It marks the facts verified, approves and publishes in one step. No one else needs to review it.'
              : 'Your draft. It saves by itself. You publish it yourself: fill in the source of the facts, then press Approve and publish. It marks the facts verified, approves and publishes in one step. No second person is needed for a platform admin.',
            role === 'approver'
              ? 'آپ کا مسودہ۔ یہ خود بخود محفوظ ہوتا ہے۔ شعبے کے سربراہ کے طور پر آپ اسے خود شائع کرتے ہیں: حقائق کا ماخذ بھریں، پھر منظور کریں اور شائع کریں دبائیں۔ یہ ایک ہی قدم میں تصدیق، منظوری اور اشاعت کرتا ہے۔ کسی اور کو جانچنے کی ضرورت نہیں۔'
              : 'آپ کا مسودہ۔ یہ خود بخود محفوظ ہوتا ہے۔ آپ اسے خود شائع کرتے ہیں: حقائق کا ماخذ بھریں، پھر منظور کریں اور شائع کریں دبائیں۔ یہ ایک ہی قدم میں تصدیق، منظوری اور اشاعت کرتا ہے۔ پلیٹ فارم ایڈمن کے لیے کسی دوسرے شخص کی ضرورت نہیں۔',
          ),
          // One press for the owner of the page (slice 3ak): mark verified, approve and publish. A head
          // looking at a draft a coordinator has not sent yet keeps the separate steps.
          actions:
            mine || target?.collection === 'departments'
              ? ['approveAndPublish']
              : ['approve', ...verify],
          showPublish: false,
        }
      }
      if (reviewer && !mine) {
        if (author === 'import') {
          return {
            tone: 'info',
            banner: w(
              'Brought in by the importer. Check it, mark it verified, then approve it.',
              'درآمد کنندہ نے لایا ہے۔ اسے جانچیں، تصدیق شدہ کریں، پھر منظور کریں۔',
            ),
            actions: ['approve', ...verify],
            showPublish: false,
          }
        }
        return {
          tone: 'info',
          banner: w(
            'Someone else’s draft. It has not been sent for review, so there is nothing for you to approve yet. It will appear under Waiting for review when the author sends it.',
            'یہ کسی اور کا مسودہ ہے۔ یہ جائزے کے لیے نہیں بھیجا گیا، اس لیے ابھی آپ کے لیے منظوری کو کچھ نہیں۔ بھیجے جانے پر یہ "جائزے کے منتظر" میں آئے گا۔',
          ),
          actions: [],
          showPublish: false,
        }
      }
      return {
        tone: 'info',
        banner: reviewer
          ? w(
              'Your draft. It saves by itself. Send it for review: another approver must approve it, because nobody approves their own work.',
              'آپ کا مسودہ۔ یہ خود بخود محفوظ ہوتا ہے۔ جائزے کے لیے بھیجیں: کوئی دوسرا منظوری دہندہ منظور کرے گا، کیونکہ کوئی اپنا کام خود منظور نہیں کرتا۔',
            )
          : w(
              `Draft. It saves by itself. Press Send for review when it is ready. Your ${office(ownerOffice)} approver will see it under Waiting for review.`,
              'مسودہ۔ یہ خود بخود محفوظ ہوتا ہے۔ تیار ہو تو جائزے کے لیے بھیجیں دبائیں۔ آپ کے دفتر کے منظوری دہندہ اسے "جائزے کے منتظر" میں دیکھیں گے۔',
            ),
        actions: submitter ? ['sendForReview'] : [],
        showPublish: false,
      }
    case 'in_review':
      if (reviewer && needsAnother) {
        return {
          tone: 'waiting',
          banner: w(
            'You wrote this, so you cannot approve it. Waiting for another approver.',
            'یہ آپ نے لکھا ہے، اس لیے آپ اسے منظور نہیں کر سکتے۔ دوسرے منظوری دہندہ کا انتظار ہے۔',
          ),
          actions: [],
          showPublish: false,
        }
      }
      if (reviewer) {
        return {
          tone: 'waiting',
          banner: w(
            'Waiting for your review. Approve it, or send it back to the editor with a reason.',
            'آپ کے جائزے کا منتظر۔ منظور کریں، یا وجہ کے ساتھ ایڈیٹر کو واپس بھیجیں۔',
          ),
          actions: ['approve', 'sendBack', ...verify],
          showPublish: false,
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
      }
    case 'approved':
      if (reviewer) {
        return {
          tone: 'ready',
          banner: unverified
            ? w(
                'Approved. Before it can be published, press Mark verified and make sure the source is filled in. Then press Publish.',
                'منظور شدہ۔ شائع کرنے سے پہلے تصدیق شدہ کریں دبائیں اور ماخذ بھریں۔ پھر شائع کریں دبائیں۔',
              )
            : w(
                'Approved and verified. Press Publish to put it on the website.',
                'منظور اور تصدیق شدہ۔ ویب سائٹ پر لانے کے لیے شائع کریں دبائیں۔',
              ),
          actions: ['sendBack', ...verify],
          showPublish: true,
        }
      }
      // A programme coordinator publishes what their head approved (slice 3aj), once it is verified.
      if (mayPublishApproved(actor, target)) {
        return unverified
          ? {
              tone: 'waiting',
              banner: w(
                'Approved by your head of department. Waiting for them to mark it verified; then you can publish it. If you change this page it goes back to Draft.',
                'شعبے کے سربراہ نے منظور کر لیا۔ ان کے تصدیق شدہ کرنے کا انتظار ہے؛ پھر آپ اسے شائع کر سکیں گے۔ صفحہ بدلا تو یہ مسودے میں واپس چلا جائے گا۔',
              ),
              actions: [],
              showPublish: false,
            }
          : {
              tone: 'ready',
              banner: w(
                'Approved and verified by your head of department. Press Publish to put it on the website. If you change anything first, it goes back to Draft.',
                'شعبے کے سربراہ نے منظور اور تصدیق کر دی۔ ویب سائٹ پر لانے کے لیے شائع کریں دبائیں۔ پہلے کچھ بدلا تو یہ مسودے میں واپس چلا جائے گا۔',
              ),
              actions: [],
              showPublish: true,
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
      }
    case 'published': {
      const offline: StepAction[] = mayTakeOffline(actor, scope) ? ['takeOffline'] : []
      if (reviewer) {
        return {
          tone: 'ready',
          banner:
            target?.collection === 'programmes' && role === 'approver'
              ? w(
                  'Live on the website. Changes save as a new draft first; Publish puts them live. A programme page is taken offline by its coordinator, not by the head.',
                  'ویب سائٹ پر شائع ہے۔ تبدیلیاں پہلے نئے مسودے کے طور پر محفوظ ہوتی ہیں؛ شائع کریں دبانے پر لائیو ہوتی ہیں۔ پروگرام کا صفحہ اس کا کوآرڈینیٹر آف لائن کرتا ہے، سربراہ نہیں۔',
                )
              : w(
                  'Live on the website. Changes save as a new draft first; Publish puts them live.',
                  'ویب سائٹ پر شائع ہے۔ تبدیلیاں پہلے نئے مسودے کے طور پر محفوظ ہوتی ہیں؛ شائع کریں دبانے پر لائیو ہوتی ہیں۔',
                ),
          actions: [...verify, ...offline],
          showPublish: true,
        }
      }
      return {
        tone: 'info',
        banner: w(
          'Live on the website. Your changes are saved as a draft and must be approved before they go live.',
          'ویب سائٹ پر شائع ہے۔ آپ کی تبدیلیاں مسودے کے طور پر محفوظ ہوں گی اور لائیو ہونے سے پہلے منظور ہونی چاہئیں۔',
        ),
        actions: offline,
        showPublish: false,
      }
    }
    case 'archived':
    default:
      return readOnly(
        w(
          'Archived. It is no longer shown on the website. Only an approver or a platform admin can restore it.',
          'آرکائیو شدہ۔ یہ اب ویب سائٹ پر نہیں دکھتا۔ صرف منظوری دہندہ یا پلیٹ فارم ایڈمن اسے بحال کر سکتا ہے۔',
        ),
      )
  }
}

/** The Stage each step button asks for. The policy decides whether the save is allowed. */
export const STEP_TARGET: Record<
  Exclude<StepAction, 'markVerified' | 'approveAndPublish' | 'takeOffline'>,
  WorkflowStatus
> = {
  sendForReview: 'in_review',
  approve: 'approved',
  sendBack: 'draft',
}

export const STEP_LABEL: Record<StepAction, Words> = {
  sendForReview: w('Send for review', 'جائزے کے لیے بھیجیں'),
  approve: w('Approve', 'منظور کریں'),
  approveAndPublish: w('Approve and publish', 'منظور کریں اور شائع کریں'),
  sendBack: w('Send back', 'واپس بھیجیں'),
  markVerified: w('Mark verified', 'تصدیق شدہ کریں'),
  takeOffline: w('Take offline', 'آف لائن کریں'),
}

/** What the banner says right after a step succeeded. */
export const STEP_DONE: Record<StepAction, Words> = {
  sendForReview: w(
    'Sent. Your approver sees it under Waiting for review.',
    'بھیج دیا گیا۔ منظوری دہندہ اسے "جائزے کے منتظر" میں دیکھے گا۔',
  ),
  approve: w(
    'Approved. An approver can now publish it.',
    'منظور ہو گیا۔ اب منظوری دہندہ اسے شائع کر سکتا ہے۔',
  ),
  approveAndPublish: w(
    'Approved, verified and published. It is live on the website.',
    'منظور، تصدیق شدہ اور شائع ہو گیا۔ یہ ویب سائٹ پر لائیو ہے۔',
  ),
  sendBack: w(
    'Sent back to Draft. The editor can change it and send it again.',
    'مسودے میں واپس بھیج دیا گیا۔',
  ),
  markVerified: w('Marked as verified.', 'تصدیق شدہ نشان زد ہو گیا۔'),
  takeOffline: w(
    'Taken offline. It is a draft again and no longer on the website. To bring it back, send it for approval again.',
    'آف لائن کر دیا گیا۔ یہ دوبارہ مسودہ ہے اور ویب سائٹ پر نہیں۔ واپس لانے کے لیے دوبارہ منظوری کے لیے بھیجیں۔',
  ),
}
