import type { CollectionConfig } from 'payload'

import {
  governedCreate,
  governedDelete,
  governedRead,
  governedReadVersions,
  governedUpdate,
} from '../governance/access'
import { withGovernance } from '../governance/fields'

/** Fields follow the Addendum field-mapping table (section 8); nothing else is invented. */
export const AffiliatedColleges: CollectionConfig = withGovernance(
  {
    slug: 'affiliated-colleges',
    // Database name. The default (slug) makes the governance enum names exceed Postgres's 63 characters.
    dbName: 'colleges',
    labels: { singular: 'Affiliated college', plural: 'Affiliated colleges' },
    admin: {
      useAsTitle: 'name',
      defaultColumns: ['name', 'sector', 'number', 'updatedAt'],
      group: 'Academics',
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
      { name: 'name', type: 'text', required: true, localized: true },
      {
        type: 'row',
        fields: [
          {
            name: 'sector',
            type: 'text',
            admin: {
              description:
                'As the university lists it. Together with the number, this identifies the college.',
            },
          },
          { name: 'number', type: 'number' },
          {
            name: 'affiliationYear',
            label: 'Affiliation year',
            type: 'number',
            min: 1900,
            max: 2100,
          },
        ],
      },
      {
        name: 'programmes',
        type: 'array',
        admin: { description: 'Programme names as the college offers them.' },
        fields: [{ name: 'name', type: 'text', required: true, localized: true }],
      },
      { name: 'address', type: 'textarea', localized: true },
      { name: 'link', type: 'text', admin: { description: 'The college website (full URL).' } },
    ],
  },
  ['name', 'sector', 'number', 'affiliationYear', 'programmes', 'address', 'link'],
)
