/**
 * Urdu for the admin screens (slice 3p, docs/briefs/p3p-urdu-admin.md, ADR-0013).
 *
 * Payload 3.93 has no Urdu admin language: it is not in its accepted-language list, it lays out only
 * Arabic, Persian and Hebrew right to left, and a missing key prints the key itself. So Urdu is built
 * here as English plus a small set of Urdu overrides, and `urduFromEnglish` fills every key a plugin
 * brings in English only. A screen with no Urdu yet shows English, never a raw key.
 *
 * Every Urdu string here is a DRAFT written by the assistant. None has been read by a native-speaking
 * member of staff, so the language is labelled as a draft in the picker (see `thisLanguage`).
 * ADR-0008: unreviewed Urdu must not pass as final.
 */
import { en } from 'payload/i18n/en'
import type { Config, Plugin } from 'payload'

/** The language entry for `i18n.supportedLanguages`. Payload's own types do not know `ur`, hence the cast at the call site. */
export const urAdminLanguage = {
  dateFNSKey: 'en-US' as const,
  translations: en.translations,
}

/** A label, description or option shown in English and Urdu. Payload picks by the person's admin language. */
export const bi = (english: string, urdu: string): { en: string; ur: string } => ({
  en: english,
  ur: urdu,
})

/** Urdu for Payload's own words. Only the ones an editor meets every day; the rest stay English until reviewed. */
export const urTranslations = {
  general: {
    thisLanguage: 'اردو (مسودہ ترجمہ)',
    dashboard: 'ڈیش بورڈ',
    createNew: 'نیا بنائیں',
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں',
    delete: 'حذف کریں',
    edit: 'ترمیم',
    confirm: 'تصدیق کریں',
    close: 'بند کریں',
    filters: 'فلٹر',
    columns: 'کالم',
    collections: 'مجموعے',
    language: 'زبان',
  },
  version: {
    publishChanges: 'تبدیلیاں شائع کریں',
    versions: 'ورژن',
  },
  authentication: {
    login: 'لاگ اِن',
    logout: 'لاگ آؤٹ',
  },
  error: {
    unauthorized:
      'اجازت نہیں ہے۔ یا تو آپ لاگ آؤٹ ہو چکے ہیں، یا آپ کا کردار یہ کام کرنے کی اجازت نہیں دیتا۔ دوبارہ لاگ اِن کریں، یا اگر آپ کو لگتا ہے کہ اجازت ہونی چاہیے تو سائٹ مینیجر سے پوچھیں۔',
  },
}

type Tree = { [key: string]: Tree | string }

const isTree = (v: unknown): v is Tree => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Copy into `target` every key that only `source` has, at any depth. Never overwrites. */
export function fillMissing(target: Tree, source: Tree): Tree {
  const out: Tree = { ...target }
  for (const [key, value] of Object.entries(source)) {
    const have = out[key]
    if (have === undefined) out[key] = value
    else if (isTree(have) && isTree(value)) out[key] = fillMissing(have, value)
  }
  return out
}

/**
 * Last plugin. Form builder, redirects, SEO and search each ship English (and some other languages)
 * but not Urdu, and Payload prints the bare key for a missing one. This gives Urdu their English.
 */
export const urduFromEnglish: Plugin = (config: Config): Config => {
  const translations = (config.i18n?.translations ?? {}) as Record<string, Tree>
  const english = translations.en ?? {}
  return {
    ...config,
    i18n: {
      ...config.i18n,
      translations: {
        ...translations,
        ur: fillMissing(translations.ur ?? {}, english),
      } as never,
    },
  }
}

/**
 * Run on the finished config. The rich-text editor adds its own words (placeholder, slash menu, toolbar)
 * to `i18n.translations` while Payload sanitises the config, after every plugin has run, so only here
 * can Urdu get their English. Without it the editor's placeholder shows the key
 * `lexical:general:placeholder`.
 */
export function completeUrdu(config: { i18n?: { translations?: unknown } }): void {
  const translations = config.i18n?.translations as Record<string, Tree> | undefined
  if (!translations?.en) return
  translations.ur = fillMissing(translations.ur ?? {}, translations.en)
}
