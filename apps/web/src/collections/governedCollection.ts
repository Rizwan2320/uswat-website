import type { CollectionConfig, Field } from 'payload'

import {
  governedCreate,
  governedDelete,
  governedRead,
  governedReadVersions,
  governedUpdate,
} from '../governance/access'
import { withGovernance } from '../governance/fields'

export interface GovernedCollectionOptions {
  slug: string
  singular: string
  plural: string
  useAsTitle: string
  group: string
  defaultColumns?: string[]
  fields: Field[]
  /** Names of top-level fields whose change counts as a content edit (governance/hooks.ts). */
  contentFields: string[]
  /** Needed when a generated database identifier would exceed 63 characters. */
  dbName?: string
}

/** Access, drafts and the governance group, the same for every organisation record. */
export function governedCollection(o: GovernedCollectionOptions): CollectionConfig {
  return withGovernance(
    {
      slug: o.slug,
      ...(o.dbName ? { dbName: o.dbName } : {}),
      labels: { singular: o.singular, plural: o.plural },
      admin: {
        useAsTitle: o.useAsTitle,
        defaultColumns: o.defaultColumns ?? [o.useAsTitle, 'updatedAt'],
        group: o.group,
      },
      access: {
        create: governedCreate,
        delete: governedDelete,
        read: governedRead,
        readVersions: governedReadVersions,
        update: governedUpdate,
      },
      versions: { drafts: { autosave: { interval: 1000 } }, maxPerDoc: 25 },
      fields: o.fields,
    },
    o.contentFields,
  )
}

export const legacyUrlField: Field = {
  name: 'legacyUrl',
  label: 'Old page URL',
  type: 'text',
  index: true,
  admin: {
    description:
      'The address of the page on the old site. Used to match records on re-import and to redirect.',
  },
}

export const documentsField: Field = {
  name: 'documents',
  type: 'array',
  admin: { description: 'PDFs and other files, as links.' },
  fields: [
    { name: 'label', type: 'text', required: true, localized: true },
    { name: 'url', type: 'text', required: true },
  ],
}

export const emailsField: Field = {
  name: 'emails',
  type: 'array',
  admin: { description: 'Published office or department addresses.' },
  fields: [{ name: 'email', type: 'email', required: true }],
}
