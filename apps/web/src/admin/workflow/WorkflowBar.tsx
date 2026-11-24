'use client'

import {
  PublishButton,
  useAuth,
  useConfig,
  useDocumentInfo,
  useField,
  useForm,
  useFormProcessing,
  useLocale,
  useTranslation,
} from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import React, { useEffect, useRef, useState } from 'react'

import {
  actorFromUser,
  type RiskClass,
  type VerificationStatus,
  type WorkflowStatus,
} from '../../governance/roles'
import {
  STEP_DONE,
  STEP_LABEL,
  STEP_TARGET,
  workflowView,
  type StepAction,
  type Words,
} from './rules'

import './workflow.scss'

/**
 * What the server accepted a moment ago, per item. Payload can hand the form a copy of the item read just
 * before the save (seen in tests: the Stage flipped back to the old one for good, though the server held
 * the new one, and this component was mounted again). Module level, so it survives that. For a few
 * seconds after a step the screen keeps the accepted values.
 */
const recentlyAccepted = new Map<
  string,
  { until: number; stage?: WorkflowStatus; verification?: VerificationStatus; note?: string }
>()

/** Outside the component so the render stays free of clock reads. */
const fiveSecondsFromNow = (): number => Date.now() + 5000

const w = (en: string, ur: string): Words => ({ en, ur })
const MORE_PUBLISH: Words = w('More publish choices', 'شائع کرنے کے مزید اختیارات')
const pick = (words: Words, language: string): string => (language === 'ur' ? words.ur : words.en)
const idOf = (v: unknown): string | null =>
  v && typeof v === 'object' && 'id' in v
    ? String((v as { id: unknown }).id)
    : typeof v === 'string' || typeof v === 'number'
      ? String(v)
      : null

/**
 * The status line and the step buttons above every governed document (slice 3aa).
 * It only sets the Stage and saves a draft, exactly as the Stage field and Save Draft would, so the
 * policy in governance/hooks.ts still decides. Buttons shown here are the ones the role may use.
 */
export function WorkflowBar(): React.ReactElement | null {
  const { user } = useAuth()
  const { id, collectionSlug } = useDocumentInfo()
  const { config } = useConfig()
  const { code: locale } = useLocale()
  const { i18n } = useTranslation()
  const { submit, getField } = useForm()
  // A save already running (the form saves drafts by itself) makes `submit` return at once without sending.
  const processing = useFormProcessing()
  const processingRef = useRef(processing)
  useEffect(() => {
    processingRef.current = processing
  }, [processing])
  const stage = useField<WorkflowStatus>({ path: 'governance.status' })
  const verification = useField<VerificationStatus>({ path: 'governance.verificationStatus' })
  const risk = useField<RiskClass>({ path: 'governance.riskClass' })
  const owner = useField<string>({ path: 'governance.ownerOffice' })
  const createdBy = useField<unknown>({ path: 'governance.createdBy' })
  const reviewNote = useField<string>({ path: 'governance.reviewNote' })
  const [asking, setAsking] = useState(false)
  const [askingOffline, setAskingOffline] = useState(false)
  const [askingMove, setAskingMove] = useState<'archive' | 'restore' | null>(null)
  const [draftNote, setDraftNote] = useState('')
  const [busy, setBusy] = useState<StepAction | null>(null)
  const [done, setDone] = useState<Words | null>(null)
  const key = `${collectionSlug}/${id}`
  useEffect(() => {
    const a = recentlyAccepted.get(key)
    if (!a || Date.now() > a.until) return
    if (a.stage && stage.value !== a.stage) stage.setValue(a.stage, true)
    if (a.verification && verification.value !== a.verification)
      verification.setValue(a.verification, true)
    if (a.note !== undefined && (reviewNote.value ?? '') !== a.note)
      reviewNote.setValue(a.note, true)
  })

  // Payload's Publish button has a small arrow that opens more choices. It is a button with only an
  // icon and no name, which a screen reader announces as just "button" (axe: button-name, slice 3ao).
  // The markup is Payload's, so the name is added here, in the language of the screen.
  const publishRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    publishRef.current?.querySelectorAll<HTMLButtonElement>('button.popup-button').forEach((b) => {
      if (!b.getAttribute('aria-label') && !b.textContent?.trim()) {
        b.setAttribute('aria-label', pick(MORE_PUBLISH, i18n.language))
      }
    })
  })

  // Keyboard: Escape closes an "are you sure" question, and focus goes back to the first button of the
  // box, so a person using only the keyboard is not left on a button that has just disappeared.
  const barRef = useRef<HTMLElement>(null)
  const anyAsk = asking || askingOffline || askingMove !== null
  const closeAsks = () => {
    setAsking(false)
    setAskingOffline(false)
    setAskingMove(null)
    requestAnimationFrame(() => barRef.current?.querySelector<HTMLElement>('button')?.focus())
  }
  if (!user) return null
  const actor = actorFromUser(user as never)
  const saved = id != null
  const creator = idOf(createdBy.value)
  const author =
    !saved || creator === String(user.id) ? 'me' : creator === null ? 'import' : 'other'
  const view = workflowView({
    actor,
    stage: stage.value ?? 'draft',
    verification: verification.value ?? 'unverified',
    risk: risk.value ?? 'standard',
    ownerOffice: owner.value ?? null,
    saved,
    author,
    target: collectionSlug ? { collection: collectionSlug, id: id ?? null } : undefined,
  })
  const language = i18n.language

  const run = async (
    action: Exclude<StepAction, 'approveAndPublish' | 'takeOffline' | 'archive' | 'restore'>,
    note?: string,
  ): Promise<boolean> => {
    if (!collectionSlug || id == null) return false
    const before = { stage: stage.value, verification: verification.value, note: reviewNote.value }
    // The five-second guard below holds the last accepted value on screen. A new press must not be
    // undone by it, so it is dropped first (found in the browser in slice 3ao: Archive pressed within
    // five seconds of publishing was put back to Published by the guard).
    recentlyAccepted.delete(key)
    setBusy(action)
    setDone(null)
    setAsking(false)
    if (action === 'markVerified') verification.setValue('verified')
    else {
      // Send back stores why; sending for review again clears it, so an old reason never lingers.
      if (action === 'sendBack') reviewNote.setValue(note ?? '')
      if (action === 'sendForReview') reviewNote.setValue('')
      stage.setValue(STEP_TARGET[action])
    }
    const url = formatAdminURL({
      apiRoute: config.routes.api,
      path: `/${collectionSlug}/${id}?locale=${locale}&depth=0&fallback-locale=null&draft=true`,
    })
    // Let the form take the new value before it is read for the save (it is read from state, not from this call).
    const wantPath =
      action === 'markVerified' ? 'governance.verificationStatus' : 'governance.status'
    const want = action === 'markVerified' ? 'verified' : STEP_TARGET[action]
    const noteReady = () =>
      action === 'sendBack' ? getField('governance.reviewNote')?.value === (note ?? '') : true
    for (let i = 0; i < 40 && !(getField(wantPath)?.value === want && noteReady()); i++) {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    for (let i = 0; i < 200 && processingRef.current; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    const result = await submit({
      action: url,
      method: 'PATCH',
      overrides: { _status: 'draft' },
      skipValidation: true,
    })
    // `result` is missing or not ok when the server refused (Payload has already shown why): put the
    // screen back to what it was, so it never claims a step that did not happen.
    if (result?.res?.ok) {
      recentlyAccepted.set(key, {
        until: fiveSecondsFromNow(),
        ...(action === 'markVerified'
          ? { verification: 'verified' as const }
          : { stage: STEP_TARGET[action] }),
        ...(action === 'sendBack'
          ? { note: note ?? '' }
          : action === 'sendForReview'
            ? { note: '' }
            : {}),
      })
      setDone(STEP_DONE[action])
    } else {
      stage.setValue(before.stage as WorkflowStatus, true)
      verification.setValue(before.verification as VerificationStatus, true)
      reviewNote.setValue(before.note ?? '', true)
    }
    setBusy(null)
    return Boolean(result?.res?.ok)
  }

  /**
   * One press for the owner of a page (slice 3ak): mark verified, approve, then publish, each through
   * the same save the separate buttons use, so the policy still decides every step. It stops at the
   * first step the server refuses (Payload shows why) and the screen stays at the last accepted step.
   */
  const approveAndPublish = async () => {
    if (!collectionSlug || id == null) return
    // Checked first so a press never leaves the page half-way (verified and approved but not live).
    const source = getField('governance.source')?.value
    if (typeof source !== 'string' || source.trim() === '') {
      setDone(
        w(
          'Fill in "Source of the facts" (on the right) first, then press Approve and publish. The source is how readers can trust the page.',
          'پہلے دائیں طرف "حقائق کا ماخذ" بھریں، پھر منظور کریں اور شائع کریں دبائیں۔ ماخذ سے قارئین کو صفحے پر اعتماد ہوتا ہے۔',
        ),
      )
      return
    }
    if (verification.value !== 'verified' && !(await run('markVerified'))) return
    if (!(await run('approve'))) return
    setBusy('approveAndPublish')
    setDone(null)
    for (let i = 0; i < 200 && processingRef.current; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    const url = formatAdminURL({
      apiRoute: config.routes.api,
      path: `/${collectionSlug}/${id}?locale=${locale}&depth=0&fallback-locale=null`,
    })
    const result = await submit({
      action: url,
      method: 'PATCH',
      overrides: { _status: 'published' },
    })
    if (result?.res?.ok) {
      recentlyAccepted.set(key, { until: fiveSecondsFromNow(), stage: 'published' })
      setDone(STEP_DONE.approveAndPublish)
    } else {
      setDone(
        w(
          'Approved and verified, but not published: the message that appeared says why. Fix it, then press Publish.',
          'منظور اور تصدیق شدہ، لیکن شائع نہیں ہوا: جو پیغام آیا اس میں وجہ ہے۔ درست کریں، پھر شائع کریں دبائیں۔',
        ),
      )
    }
    setBusy(null)
  }

  /**
   * Take a live page offline (slice 3al): the same save as Payload's Unpublish, asked for once more
   * first because it removes the page from the website. The server decides who may (policy.ts).
   */
  const takeOffline = async () => {
    if (!collectionSlug || id == null) return
    setAskingOffline(false)
    setBusy('takeOffline')
    setDone(null)
    for (let i = 0; i < 200 && processingRef.current; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    const url = formatAdminURL({
      apiRoute: config.routes.api,
      path: `/${collectionSlug}/${id}?locale=${locale}&depth=0&fallback-locale=null`,
    })
    const result = await submit({
      action: url,
      method: 'PATCH',
      overrides: { _status: 'draft' },
      skipValidation: true,
    })
    if (result?.res?.ok) {
      recentlyAccepted.set(key, { until: fiveSecondsFromNow(), stage: 'draft' })
      setDone(STEP_DONE.takeOffline)
    }
    setBusy(null)
  }

  /**
   * Archive a live page, or restore an archived one (slice 3ao). Both are a publishing save with the Stage
   * set to Archived or Published, which is what the server accepts for these two moves; it checks who may
   * and, for a restore, the publish checks again. Asked for once more first: both change what the public sees.
   */
  const archiveOrRestore = async (kind: 'archive' | 'restore') => {
    if (!collectionSlug || id == null) return
    const want: WorkflowStatus = kind === 'archive' ? 'archived' : 'published'
    const before = stage.value
    recentlyAccepted.delete(key)
    setAskingMove(null)
    setBusy(kind)
    setDone(null)
    stage.setValue(want)
    for (let i = 0; i < 40 && getField('governance.status')?.value !== want; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    for (let i = 0; i < 200 && processingRef.current; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    const url = formatAdminURL({
      apiRoute: config.routes.api,
      path: `/${collectionSlug}/${id}?locale=${locale}&depth=0&fallback-locale=null`,
    })
    const result = await submit({
      action: url,
      method: 'PATCH',
      overrides: { _status: 'published' },
    })
    if (result?.res?.ok) {
      recentlyAccepted.set(key, { until: fiveSecondsFromNow(), stage: want })
      setDone(STEP_DONE[kind])
    } else {
      // The server refused (Payload has shown why): the screen goes back to what is true.
      stage.setValue((before ?? 'draft') as WorkflowStatus, true)
    }
    setBusy(null)
  }

  return (
    <section
      ref={barRef}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && anyAsk) {
          e.stopPropagation()
          closeAsks()
        }
      }}
      className={`workflow-bar workflow-bar--${view.tone}`}
      aria-label={language === 'ur' ? 'آئٹم کی حالت' : 'Item status'}
    >
      <p className="workflow-bar__stage">
        <span className="workflow-bar__badge">{stageLabel(stage.value ?? 'draft', language)}</span>
        <span role="status">{done ? pick(done, language) : pick(view.banner, language)}</span>
      </p>
      {stage.value === 'draft' && reviewNote.value ? (
        <p className="workflow-bar__note">
          <strong>{language === 'ur' ? 'واپس بھیجا گیا:' : 'Sent back:'}</strong> {reviewNote.value}
        </p>
      ) : null}
      {asking ? (
        <div className="workflow-bar__ask">
          <label htmlFor="workflow-note">
            {language === 'ur'
              ? 'ایڈیٹر کو بتائیں کہ کیا درست کرنا ہے'
              : 'Tell the editor what to fix (required)'}
          </label>
          <textarea
            id="workflow-note"
            rows={3}
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
          />
          <div className="workflow-bar__actions">
            <button
              type="button"
              className="workflow-bar__button workflow-bar__button--approve"
              disabled={busy !== null || draftNote.trim().length === 0}
              onClick={() => void run('sendBack', draftNote.trim())}
            >
              {pick(STEP_LABEL.sendBack, language)}
            </button>
            <button type="button" className="workflow-bar__button" onClick={closeAsks}>
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : askingOffline ? (
        <div className="workflow-bar__ask">
          <p role="alert">
            {language === 'ur'
              ? 'یہ صفحہ ویب سائٹ سے ہٹ جائے گا اور مسودہ بن جائے گا۔ واپس لانے کے لیے دوبارہ منظوری درکار ہوگی۔ کیا آف لائن کریں؟'
              : 'This removes the page from the website and makes it a draft. Bringing it back needs approval again. Take it offline?'}
          </p>
          <div className="workflow-bar__actions">
            <button
              type="button"
              className="workflow-bar__button workflow-bar__button--takeOffline"
              disabled={busy !== null}
              onClick={() => void takeOffline()}
            >
              {language === 'ur' ? 'ہاں، آف لائن کریں' : 'Yes, take it offline'}
            </button>
            <button type="button" className="workflow-bar__button" onClick={closeAsks}>
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : askingMove ? (
        <div className="workflow-bar__ask">
          <p role="alert">
            {askingMove === 'archive'
              ? language === 'ur'
                ? 'یہ صفحہ ویب سائٹ سے ہٹ جائے گا مگر ریکارڈ میں محفوظ رہے گا۔ اسے صرف شعبے کا سربراہ یا پلیٹ فارم ایڈمن بحال کر سکتا ہے۔ کیا آرکائیو کریں؟'
                : 'This takes the page off the website and keeps it on record. Only a head of department or a platform admin can restore it. Archive it?'
              : language === 'ur'
                ? 'یہ صفحہ جیسا آرکائیو ہوا تھا ویسا ہی ویب سائٹ پر واپس آ جائے گا۔ کیا بحال کریں؟'
                : 'This puts the page back on the website exactly as it was archived. Restore it?'}
          </p>
          <div className="workflow-bar__actions">
            <button
              type="button"
              className={`workflow-bar__button workflow-bar__button--${askingMove}`}
              disabled={busy !== null}
              onClick={() => void archiveOrRestore(askingMove)}
              autoFocus
            >
              {askingMove === 'archive'
                ? language === 'ur'
                  ? 'ہاں، آرکائیو کریں'
                  : 'Yes, archive it'
                : language === 'ur'
                  ? 'ہاں، بحال کریں'
                  : 'Yes, restore it'}
            </button>
            <button type="button" className="workflow-bar__button" onClick={closeAsks}>
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : view.actions.length > 0 || view.showPublish ? (
        <div className="workflow-bar__actions">
          {view.actions.map((a) => (
            <button
              key={a}
              type="button"
              className={`workflow-bar__button workflow-bar__button--${a}`}
              disabled={busy !== null}
              onClick={() =>
                a === 'sendBack'
                  ? setAsking(true)
                  : a === 'approveAndPublish'
                    ? void approveAndPublish()
                    : a === 'takeOffline'
                      ? setAskingOffline(true)
                      : a === 'archive' || a === 'restore'
                        ? setAskingMove(a)
                        : void run(a)
              }
            >
              {pick(STEP_LABEL[a], language)}
            </button>
          ))}
          {view.showPublish ? (
            // Payload's own Publish press starts a new save: the guard from the step before must not
            // hold the old stage on screen over what this save returns (found in the browser, slice 3ao:
            // Publish within five seconds of Approve left the box saying Approved on a live page).
            <span
              ref={publishRef}
              className="workflow-bar__publish"
              onClickCapture={() => recentlyAccepted.delete(key)}
            >
              <PublishButton />
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

const STAGES: Record<WorkflowStatus, Words> = {
  draft: { en: 'Draft', ur: 'مسودہ' },
  in_review: { en: 'In review', ur: 'زیرِ جائزہ' },
  approved: { en: 'Approved', ur: 'منظور شدہ' },
  published: { en: 'Published', ur: 'شائع شدہ' },
  archived: { en: 'Archived', ur: 'آرکائیو شدہ' },
}
const stageLabel = (s: WorkflowStatus, language: string): string =>
  pick(STAGES[s] ?? STAGES.draft, language)

export default WorkflowBar
