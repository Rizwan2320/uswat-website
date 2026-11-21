import { plainSlugField } from '@/fields/plainSlug'

import type { ArrayField } from 'payload'

import { safeHrefValidate } from '../governance/fields'
import {
  faqField,
  iconTitledList,
  line,
  paragraph,
  paragraphsField,
  pictureField,
  shortListField,
} from './academics/pageFields'
import { governedCollection, legacyUrlField } from './governedCollection'

/** One semester per row. The site groups rows by year; two rows for one semester would show it twice. */
const curriculumField: ArrayField = {
  name: 'curriculum',
  label: 'Curriculum by semester',
  type: 'array',
  dbName: 'programme_curriculum',
  maxRows: 12,
  labels: { singular: 'Semester', plural: 'Semesters' },
  admin: {
    description:
      'One row for each semester: its year (1 to 6) and term (1 or 2), then the course names. Up to 12 rows.',
    initCollapsed: true,
  },
  validate: (value: unknown) => {
    const seen = new Set<string>()
    for (const row of Array.isArray(value) ? (value as { year?: number; term?: string }[]) : []) {
      const key = `${row?.year}-${row?.term}`
      if (seen.has(key))
        return `Year ${row?.year}, term ${row?.term} is listed twice. Keep one row for each semester.`
      seen.add(key)
    }
    return true
  },
  fields: [
    {
      name: 'year',
      label: 'Year',
      type: 'number',
      required: true,
      min: 1,
      max: 6,
      admin: { step: 1, description: 'Year of study, 1 to 6.' },
    },
    {
      name: 'term',
      label: 'Term',
      type: 'select',
      required: true,
      options: [
        { label: 'First semester', value: '1' },
        { label: 'Second semester', value: '2' },
      ],
    },
    shortListField('courses', 'Courses', 'Course names, up to 8.', { max: 8, maxLength: 80 }),
  ],
}

const skillsField: ArrayField = {
  name: 'skills',
  label: 'Skills',
  type: 'array',
  dbName: 'programme_skills',
  maxRows: 6,
  labels: { singular: 'Skill group', plural: 'Skill groups' },
  admin: { description: 'Groups of skills students gain, up to 6.', initCollapsed: true },
  fields: [
    line('group', { label: 'Group name', maxLength: 60 }),
    shortListField('items', 'Skills', 'Up to 8.', { max: 8, maxLength: 60 }),
  ],
}

const outcomesField: ArrayField = {
  name: 'outcomes',
  label: 'Learning outcomes',
  type: 'array',
  dbName: 'programme_outcomes',
  maxRows: 8,
  labels: { singular: 'Outcome', plural: 'Outcomes' },
  admin: { description: 'What a graduate can do, one line each, up to 8.', initCollapsed: true },
  fields: [line('text', { label: 'Outcome', maxLength: 200 })],
}

/**
 * Programme belongs to a department. Level, duration, eligibility, the fee link and the apply link are
 * filled by a person (Addendum 8). `level` is free text until the university supplies the list of levels.
 */
export const Programmes = governedCollection({
  slug: 'programmes',
  singular: 'Programme',
  plural: 'Programmes',
  useAsTitle: 'name',
  createAdminOnly: true,
  group: 'Organisation',
  defaultColumns: ['name', 'department', 'campus', 'updatedAt'],
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    plainSlugField({ useAsSlug: 'name', position: undefined }),
    legacyUrlField,
    { name: 'department', type: 'relationship', relationTo: 'departments' },
    { name: 'campus', type: 'relationship', relationTo: 'campuses' },
    { name: 'level', type: 'text' },
    { name: 'duration', type: 'text', localized: true },
    { name: 'eligibility', type: 'textarea', localized: true },
    { name: 'curriculumUrl', label: 'Curriculum PDF', type: 'text', validate: safeHrefValidate },
    { name: 'feeLink', label: 'Fee information link', type: 'text', validate: safeHrefValidate },
    {
      name: 'applyUrl',
      label: 'Apply link',
      type: 'text',
      validate: safeHrefValidate,
      admin: {
        description:
          'Where applicants start their application (the admissions portal page for this programme). Leave empty to hide the Apply button.',
      },
    },
    {
      name: 'order',
      label: 'Show order',
      type: 'number',
      min: 0,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Programmes are listed on the department page from the lowest number up. Leave empty to list it last.',
      },
    },
    {
      name: 'pageContent',
      label: 'Page content',
      type: 'group',
      admin: {
        description:
          'The words and pictures of the programme page. Plain text only: no links, no formatting. Leave a part empty to leave that section out of the page.',
      },
      fields: [
        line('shortName', {
          label: 'Short name',
          maxLength: 40,
          description: 'For example "BS CS".',
        }),
        line('tagline', { label: 'Tagline', description: 'One short line under the name.' }),
        paragraph('summary', {
          label: 'Summary',
          maxLength: 240,
          description: 'One or two sentences for the card on the department page.',
        }),
        pictureField(
          'heroImage',
          'Main picture',
          'The large picture at the top. It needs alt text in the media library.',
        ),
        pictureField(
          'tileImage',
          'Card picture',
          'The small picture on the department page card. It needs alt text.',
        ),
        pictureField(
          'figureImage',
          'Overview picture',
          'The light picture beside the overview. It needs alt text.',
        ),
        paragraphsField('about', 'About the programme', 4),
        outcomesField,
        iconTitledList('whyStudy', {
          label: 'Why study this',
          singular: 'Reason',
          max: 6,
          description: 'Short reasons to choose the programme.',
        }),
        iconTitledList('tracks', {
          label: 'Tracks',
          singular: 'Track',
          max: 6,
          description: 'Areas a student can specialise in.',
        }),
        skillsField,
        curriculumField,
        iconTitledList('careers', {
          label: 'Careers',
          singular: 'Career',
          max: 8,
          description: 'Where graduates work.',
        }),
        faqField,
      ],
    },
  ],
  contentFields: [
    'name',
    'slug',
    'legacyUrl',
    'department',
    'campus',
    'level',
    'duration',
    'eligibility',
    'curriculumUrl',
    'feeLink',
    'applyUrl',
    'order',
    'pageContent',
  ],
})
