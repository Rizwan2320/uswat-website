import type { CollectionConfig } from 'payload'

import {
  governedCreate,
  governedDelete,
  governedRead,
  governedReadVersions,
  governedUpdate,
} from '../governance/access'
import { withGovernance } from '../governance/fields'

/** Fields follow the Addendum field-mapping table (section 8): section, name, phone, email, hours. */
export const ContactDirectory: CollectionConfig = withGovernance(
  {
    slug: 'contact-directory',
    // Database name. The default (slug) makes the governance enum names exceed Postgres's 63 characters.
    dbName: 'contacts',
    labels: { singular: 'Directory entry', plural: 'Contact directory' },
    admin: {
      useAsTitle: 'name',
      defaultColumns: ['name', 'section', 'updatedAt'],
      group: 'Directory',
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
      {
        name: 'section',
        type: 'text',
        required: true,
        index: true,
        admin: {
          description:
            'The heading this entry is listed under. Together with the name, this identifies the entry.',
        },
      },
      { name: 'name', type: 'text', required: true, localized: true },
      { name: 'phones', type: 'array', fields: [{ name: 'number', type: 'text', required: true }] },
      { name: 'email', type: 'email' },
      { name: 'hours', type: 'text', localized: true },
    ],
  },
  ['section', 'name', 'phones', 'email', 'hours'],
)
