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
  processingRef.current = processing
  const stage = useField<WorkflowStatus>({ path: 'governance.status' })
  const verification = useField<VerificationStatus>({ path: 'governance.verificationStatus' })
  const risk = useField<RiskClass>({ path: 'governance.riskClass' })
  const owner = useField<string>({ path: 'governance.ownerOffice' })
  const createdBy = useField<unknown>({ path: 'governance.createdBy' })
  const reviewNote = useField<string>({ path: 'governance.reviewNote' })
  const [asking, setAsking] = useState(false)
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
  })
  const language = i18n.language

  const run = async (action: StepAction, note?: string) => {
    if (!collectionSlug || id == null) return
    const before = { stage: stage.value, verification: verification.value, note: reviewNote.value }
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
        until: Date.now() + 5000,
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
  }

  return (
    <section
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
            <button type="button" className="workflow-bar__button" onClick={() => setAsking(false)}>
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
              onClick={() => (a === 'sendBack' ? setAsking(true) : void run(a))}
            >
              {pick(STEP_LABEL[a], language)}
            </button>
          ))}
          {view.showPublish ? (
            <span className="workflow-bar__publish">
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
