import { plainSlugField } from '@/fields/plainSlug'

import {
  faqField,
  iconTitledList,
  line,
  paragraph,
  paragraphsField,
  pictureField,
  shortListField,
} from './academics/pageFields'

import {
  documentsField,
  emailsField,
  governedCollection,
  legacyUrlField,
} from './governedCollection'

/** Department belongs to a faculty group; the head is a person (a human supplies it, Addendum 8). */
export const Departments = governedCollection({
  slug: 'departments',
  singular: 'Department',
  plural: 'Departments',
  useAsTitle: 'name',
  createAdminOnly: true,
  group: 'Organisation',
  defaultColumns: ['name', 'facultyGroup', 'updatedAt'],
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    plainSlugField({ useAsSlug: 'name', position: undefined }),
    legacyUrlField,
    { name: 'facultyGroup', label: 'Faculty group', type: 'relationship', relationTo: 'faculties' },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'vision', type: 'textarea', localized: true },
    { name: 'mission', type: 'textarea', localized: true },
    { name: 'head', label: 'Head of department', type: 'relationship', relationTo: 'people' },
    documentsField,
    emailsField,
    {
      name: 'order',
      label: 'Show order',
      type: 'number',
      min: 0,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Departments are listed from the lowest number up. Leave empty to list it last.',
      },
    },
    {
      // Everything the department's own page shows beyond the facts above (slice 3ad). Plain text only.
      name: 'pageContent',
      label: 'Page content',
      type: 'group',
      admin: {
        description:
          'The words and pictures of the department page. Plain text only: no links, no formatting. Leave a part empty to leave that section out of the page.',
      },
      fields: [
        line('shortName', {
          label: 'Short name',
          maxLength: 40,
          description: 'For example "DCST".',
        }),
        line('tagline', { label: 'Tagline', description: 'One short line under the name.' }),
        paragraph('intro', {
          label: 'Introduction',
          maxLength: 300,
          description: 'One or two sentences at the top. Keep it different from About.',
        }),
        pictureField(
          'heroImage',
          'Main picture',
          'The large picture at the top. It needs alt text in the media library.',
        ),
        pictureField(
          'campusPhoto',
          'Campus photo',
          'A photograph of the department building. It needs alt text.',
        ),
        paragraphsField('about', 'About the department', 4),
        iconTitledList('highlights', {
          label: 'Highlights',
          singular: 'Highlight',
          max: 6,
          description: 'Short reasons to choose the department.',
        }),
        {
          name: 'labs',
          label: 'Labs',
          type: 'array',
          maxRows: 6,
          labels: { singular: 'Lab', plural: 'Labs' },
          admin: { description: 'Laboratories and facilities, up to 6.', initCollapsed: true },
          fields: [
            line('title', { label: 'Title', maxLength: 80 }),
            paragraph('text', { label: 'Text', maxLength: 300 }),
            pictureField('image', 'Picture', 'It needs alt text in the media library.'),
            shortListField('tools', 'Tools', 'Equipment or software, up to 6.'),
          ],
        },
        iconTitledList('researchAreas', {
          label: 'Research areas',
          dbName: 'research',
          singular: 'Research area',
          max: 6,
          description: 'Topics the department works on.',
          extra: [shortListField('tags', 'Tags', 'Keywords, up to 6.')],
        }),
        iconTitledList('careers', {
          label: 'Careers',
          singular: 'Career',
          max: 8,
          description: 'Where graduates work.',
        }),
        iconTitledList('studentLife', {
          label: 'Student life',
          singular: 'Item',
          max: 6,
          description: 'Societies, events and support for students.',
        }),
        faqField,
        line('location', { label: 'Location', description: 'Where the department is on campus.' }),
        line('officeHours', { label: 'Office hours', maxLength: 80 }),
      ],
    },
  ],
  contentFields: [
    'name',
    'slug',
    'legacyUrl',
    'facultyGroup',
    'summary',
    'vision',
    'mission',
    'head',
    'documents',
    'emails',
    'order',
    'pageContent',
  ],
})
