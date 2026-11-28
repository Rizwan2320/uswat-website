/**
 * Building blocks for the public page content of departments (slice 3ad) and programmes (slice 3ae).
 * Everything an editor types here is plain text (src/governance/plainText.ts), lists have the
 * maximums the page layout is tested up to, and a list is shared across languages: only the words
 * inside each row are localized, so the Urdu editor does not rebuild rows, icons or pictures.
 */
import type {
  ArrayField,
  Field,
  TextareaFieldValidation,
  TextFieldManyValidation,
  TextFieldSingleValidation,
} from 'payload'
import { text, textarea } from 'payload/shared'

import { safeHrefValidate } from '../../governance/fields'
import { PLAIN_TEXT_MESSAGE, plainTextProblem } from '../../governance/plainText'

/** The 20 icons the public pages can draw. Keep equal to `IconName` in `src/site/academics/types.ts`. */
export const ACADEMIC_ICONS = [
  'code',
  'layers',
  'network',
  'chart',
  'brain',
  'flask',
  'book',
  'briefcase',
  'users',
  'trophy',
  'spark',
  'shield',
  'cloud',
  'phone',
  'search',
  'rocket',
  'globe',
  'cap',
  'gear',
  'database',
] as const

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const plainTextValidate: TextFieldSingleValidation = (value, options) => {
  const base = text(value, options)
  if (base !== true) return base
  const problem = plainTextProblem(value)
  return problem ? PLAIN_TEXT_MESSAGE[problem] : true
}

export const plainTextareaValidate: TextareaFieldValidation = (value, options) => {
  const base = textarea(value, options)
  if (base !== true) return base
  const problem = plainTextProblem(value)
  return problem ? PLAIN_TEXT_MESSAGE[problem] : true
}

export const plainTextManyValidate: TextFieldManyValidation = (value, options) => {
  const base = text(value as never, options as never)
  if (base !== true) return base
  for (const item of Array.isArray(value) ? value : []) {
    const problem = plainTextProblem(item)
    if (problem) return PLAIN_TEXT_MESSAGE[problem]
  }
  return true
}

type Described = { label?: string; description?: string }

/** A short line of plain text, shown in the language being edited. */
export const line = (name: string, o: Described & { maxLength?: number } = {}): Field => ({
  name,
  type: 'text',
  localized: true,
  maxLength: o.maxLength ?? 140,
  validate: plainTextValidate,
  ...(o.label ? { label: o.label } : {}),
  ...(o.description ? { admin: { description: o.description } } : {}),
})

/** A few sentences of plain text. */
export const paragraph = (name: string, o: Described & { maxLength?: number } = {}): Field => ({
  name,
  type: 'textarea',
  localized: true,
  maxLength: o.maxLength ?? 500,
  validate: plainTextareaValidate,
  ...(o.label ? { label: o.label } : {}),
  ...(o.description ? { admin: { description: o.description } } : {}),
})

/** One of the icons the pages can draw. Shared across languages. */
export const iconField: Field = {
  name: 'icon',
  label: 'Icon',
  type: 'select',
  required: true,
  options: ACADEMIC_ICONS.map((value) => ({ label: cap(value), value })),
  admin: { description: 'The small picture drawn beside the title.' },
}

/** A picture from the media library. Alt text and rights are checked when the item is published. */
export const pictureField = (name: string, label: string, description: string): Field => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  admin: { description },
})

/** Short words or names (tools, tags, course names). Not translated. */
export const shortListField = (
  name: string,
  label: string,
  description: string,
  o: { max?: number; maxLength?: number } = {},
): Field => ({
  name,
  label,
  type: 'text',
  hasMany: true,
  maxRows: o.max ?? 6,
  maxLength: o.maxLength ?? 40,
  validate: plainTextManyValidate,
  admin: { description },
})

/** A list of icon, title and text: highlights, careers, student life, research areas, tracks. */
export function iconTitledList(
  name: string,
  o: {
    label: string
    singular: string
    max: number
    description: string
    extra?: Field[]
    /** A shorter database name, when the generated versions-table names would pass 63 characters. */
    dbName?: string
  },
): ArrayField {
  return {
    name,
    label: o.label,
    type: 'array',
    ...(o.dbName ? { dbName: o.dbName } : {}),
    maxRows: o.max,
    labels: { singular: o.singular, plural: o.label },
    admin: { description: `${o.description} Up to ${o.max}.`, initCollapsed: true },
    fields: [
      iconField,
      line('title', { label: 'Title', maxLength: 80 }),
      paragraph('text', { label: 'Text', maxLength: 300 }),
      ...(o.extra ?? []),
    ],
  }
}

/** Questions and answers. */
export const faqField: ArrayField = {
  name: 'faq',
  label: 'Questions and answers',
  type: 'array',
  maxRows: 12,
  labels: { singular: 'Question', plural: 'Questions' },
  admin: { description: 'Common questions, up to 12.', initCollapsed: true },
  fields: [
    line('question', { label: 'Question', maxLength: 160 }),
    paragraph('answer', { label: 'Answer', maxLength: 600 }),
  ],
}

/** The kinds of work an alumni card can show. Keep equal to `AlumniKind` in `src/site/academics/alumni.ts`. */
export const ALUMNI_KINDS = ['Thesis', 'Final-year project', 'Research paper'] as const

/**
 * "Our alumni" on a department or programme page (slice 3at): graduates whose work the department wants to
 * show. Each is a card on the page; the card links to the work when a link is given. A photograph is only
 * for someone who agreed to it.
 */
export const alumniField: ArrayField = {
  name: 'alumni',
  label: 'Alumni',
  type: 'array',
  maxRows: 6,
  labels: { singular: 'Alumnus', plural: 'Alumni' },
  admin: {
    description:
      'Graduates whose work you want to show, up to 6. Add a photograph only with the person’s consent. Leave empty to show the example entries.',
    initCollapsed: true,
  },
  fields: [
    line('name', { label: 'Name', maxLength: 80 }),
    {
      name: 'classOf',
      label: 'Year of graduation',
      type: 'number',
      required: true,
      min: 1990,
      max: 2100,
    },
    {
      name: 'kind',
      label: 'Kind of work',
      type: 'select',
      required: true,
      options: ALUMNI_KINDS.map((value) => ({ label: value, value })),
    },
    line('headline', {
      label: 'Headline',
      maxLength: 140,
      description: 'What the work is, in one line.',
    }),
    paragraph('summary', {
      label: 'Summary',
      maxLength: 400,
      description: 'Two or three sentences about the work.',
    }),
    pictureField(
      'photo',
      'Photograph',
      'A portrait, about 4:5. Only with the person’s consent. It needs alt text in the media library.',
    ),
    {
      name: 'workUrl',
      label: 'Link to the work',
      type: 'text',
      validate: safeHrefValidate,
      admin: {
        description:
          'The public address of the thesis, project or paper (https://...). Leave empty if there is none.',
      },
    },
  ],
}

/** Paragraphs of plain text, in the order they are shown. */
export const paragraphsField = (name: string, label: string, max: number): ArrayField => ({
  name,
  label,
  type: 'array',
  maxRows: max,
  labels: { singular: 'Paragraph', plural: 'Paragraphs' },
  admin: { description: `Plain paragraphs, up to ${max}.`, initCollapsed: true },
  fields: [paragraph('text', { label: 'Paragraph', maxLength: 900 })],
})
