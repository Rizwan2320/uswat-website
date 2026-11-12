import type { CollectionConfig } from 'payload'

import {
  governedCreate,
  governedDelete,
  governedRead,
  governedReadVersions,
  governedUpdate,
} from '../governance/access'
import { safeHrefValidate, withGovernance } from '../governance/fields'

/**
 * Merit lists. The Addendum files these inside AdmissionsCycles; that collection does not exist
 * yet (P4), so the cycle and the programme are plain text for now and become relationships by a
 * later migration. Merit lists are admission outcomes, but the risk class defaults to Standard (the code sets no default); the importer or the approver raises it to High-impact per list.
 */
export const MeritLists: CollectionConfig = withGovernance(
  {
    slug: 'merit-lists',
    labels: { singular: 'Merit list', plural: 'Merit lists' },
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'admissionCycle', 'programme', 'updatedAt'],
      group: 'Admissions',
    },
    access: {
      create: governedCreate,
      delete: governedDelete,
      read: governedRead,
      readVersions: governedReadVersions,
      update: governedUpdate,
    },
    versions: { drafts: { autosave: { interval: 1000 } }, maxPerDoc: 25 },
    fields: [
      { name: 'title', type: 'text', required: true, localized: true },
      {
        name: 'legacyUrl',
        label: 'Address on the old site',
        type: 'text',
        index: true,
        admin: {
          description:
            'The address of the page on the old site. Used to match records on re-import and to redirect.',
        },
      },
      {
        name: 'admissionCycle',
        label: 'Admission cycle',
        type: 'text',
        admin: { description: 'For example "Fall 2026".' },
      },
      { name: 'programme', type: 'text' },
      {
        name: 'documents',
        type: 'array',
        admin: { description: 'The PDF lists, as links.' },
        fields: [
          {
            name: 'label',
            label: 'Link text',
            type: 'text',
            required: true,
            localized: true,
            admin: {
              description:
                'Say what the file is, for example "BS Computer Science, Fall 2026 (PDF)".',
            },
          },
          {
            name: 'url',
            label: 'Web address',
            type: 'text',
            required: true,
            validate: safeHrefValidate,
            admin: { description: 'Where the PDF is, starting with https://' },
          },
        ],
      },
    ],
  },
  ['title', 'legacyUrl', 'admissionCycle', 'programme', 'documents'],
)
