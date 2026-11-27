'use client'

import { FieldLabel, useField, useTranslation } from '@payloadcms/ui'
import React, { useId } from 'react'

import { cleanHex } from '../../governance/homePalette'

type Props = {
  path: string
  /** Passed in the field's `clientProps`: a custom Field component does not receive the label or description itself. */
  label?: string
  description?: string
  standard?: string
}

const COPY = {
  standard: { en: 'Use the standard colour', ur: 'معیاری رنگ استعمال کریں' },
  usingStandard: { en: 'Standard colour in use', ur: 'معیاری رنگ استعمال ہو رہا ہے' },
  hex: { en: 'Colour code', ur: 'رنگ کا کوڈ' },
  bad: {
    en: 'Type a code like #003b17, six digits after the #.',
    ur: '#003b17 جیسا کوڈ لکھیں، # کے بعد چھ ہندسے۔',
  },
}

/**
 * A colour picker for one landing-page colour. The stored value is plain text, `#rrggbb`, or empty
 * (empty means the standard colour). The browser's own colour chooser sets it, or a code can be typed.
 */
export default function ColourPicker({ path, label, description, standard = '#000000' }: Props) {
  const { value, setValue, showError } = useField<string | null>({ path })
  const { i18n } = useTranslation()
  const lang = i18n?.language === 'ur' ? 'ur' : 'en'
  const t = (k: keyof typeof COPY) => COPY[k][lang]
  const id = useId()

  const text = typeof value === 'string' ? value : ''
  const valid = cleanHex(text)
  const shown = valid ?? standard
  const typedBad = text !== '' && !valid

  return (
    <div className="field-type text" style={{ marginBottom: 'calc(var(--base) * 1.2)' }}>
      {label ? <FieldLabel label={label} htmlFor={`${id}-hex`} /> : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <input
          id={`${id}-picker`}
          type="color"
          aria-label={label}
          value={shown}
          onChange={(e) => setValue(e.target.value.toLowerCase())}
          style={{
            width: 56,
            height: 40,
            padding: 2,
            cursor: 'pointer',
            background: 'transparent',
          }}
        />
        <input
          id={`${id}-hex`}
          type="text"
          aria-label={`${label ?? ''} ${t('hex')}`.trim()}
          aria-invalid={typedBad || showError ? true : undefined}
          value={text}
          placeholder={standard}
          spellCheck={false}
          maxLength={7}
          onChange={(e) => setValue(e.target.value.trim() === '' ? null : e.target.value)}
          style={{ width: 120, fontFamily: 'monospace' }}
        />
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          onClick={() => setValue(null)}
          disabled={text === ''}
        >
          {t('standard')}
        </button>
        {text === '' ? <span style={{ opacity: 0.7 }}>{t('usingStandard')}</span> : null}
      </div>
      {typedBad ? (
        <div role="alert" style={{ color: 'var(--theme-error-500)', marginTop: 6 }}>
          {t('bad')}
        </div>
      ) : null}
      {description ? (
        <div className="field-description" style={{ marginTop: 6 }}>
          {description}
        </div>
      ) : null}
    </div>
  )
}
