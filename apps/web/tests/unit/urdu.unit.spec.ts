import { describe, expect, it } from 'vitest'
import type { Config } from 'payload'

import { bi, completeUrdu, fillMissing, urduFromEnglish, urTranslations } from '../../src/i18n/ur'

describe('Urdu admin language (slice 3p)', () => {
  it('fillMissing copies only keys the target lacks, at any depth, and never overwrites', () => {
    const target = { general: { save: 'محفوظ کریں' } }
    const source = {
      general: { save: 'Save', cancel: 'Cancel' },
      'plugin-redirects': { fromUrl: 'From URL' },
    }
    expect(fillMissing(target, source)).toEqual({
      general: { save: 'محفوظ کریں', cancel: 'Cancel' },
      'plugin-redirects': { fromUrl: 'From URL' },
    })
    expect(target).toEqual({ general: { save: 'محفوظ کریں' } }) // input untouched
  })

  it('the plugin gives Urdu the English words of every group a plugin added, keeping Urdu already written', async () => {
    const out = (await urduFromEnglish({
      collections: [],
      i18n: {
        translations: {
          en: { 'plugin-seo': { title: 'Title' }, general: { save: 'Save' } },
          ur: { general: { save: 'محفوظ کریں' } },
        },
      },
    } as unknown as Config)) as unknown as { i18n: { translations: Record<string, unknown> } }
    expect(out.i18n.translations.ur).toEqual({
      general: { save: 'محفوظ کریں' },
      'plugin-seo': { title: 'Title' },
    })
  })

  it('works when the config has no translations yet', async () => {
    const out = (await urduFromEnglish({ collections: [] } as unknown as Config)) as unknown as {
      i18n: { translations: Record<string, unknown> }
    }
    expect(out.i18n.translations.ur).toEqual({})
  })

  it('the language is labelled as a draft translation in the picker', () => {
    expect(urTranslations.general.thisLanguage).toContain('مسودہ')
  })

  it('bi() pairs the two languages', () => {
    expect(bi('Stage', 'مرحلہ')).toEqual({ en: 'Stage', ur: 'مرحلہ' })
  })

  it('completeUrdu gives Urdu the words added to English late, such as the rich-text editor placeholder', () => {
    const config = {
      i18n: {
        translations: {
          en: { lexical: { general: { placeholder: 'Start typing' } } },
          ur: { general: { save: 'محفوظ کریں' } },
        },
      },
    }
    completeUrdu(config)
    expect(config.i18n.translations.ur).toEqual({
      general: { save: 'محفوظ کریں' },
      lexical: { general: { placeholder: 'Start typing' } },
    })
  })
})
