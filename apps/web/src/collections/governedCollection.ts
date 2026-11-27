import type { CollectionConfig, Field } from 'payload'

import {
  governedCreate,
  governedCreateAdminOnly,
  governedCreateAdminOrHead,
  governedDelete,
  governedReadFor,
  governedReadVersionsFor,
  governedUpdate,
} from '../governance/access'
import { safeHrefValidate, withGovernance } from '../governance/fields'

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
  /** Only a platform admin may create a record (departments and programmes). */
  createAdminOnly?: boolean
  /** A platform admin, or a head of department (programmes, slice 3ap). Wins over `createAdminOnly`. */
  createAdminOrHead?: boolean
  /** Extra collection hooks, merged with the governance hooks. */
  hooks?: CollectionConfig['hooks']
}

/** Access, drafts and the governance group, the same for every organisation record. */
export function governedCollection(o: GovernedCollectionOptions): CollectionConfig {
  return withGovernance(
    {
      slug: o.slug,
      ...(o.dbName ? { dbName: o.dbName } : {}),
      ...(o.hooks ? { hooks: o.hooks } : {}),
      labels: { singular: o.singular, plural: o.plural },
      admin: {
        useAsTitle: o.useAsTitle,
        defaultColumns: o.defaultColumns ?? [o.useAsTitle, 'updatedAt'],
        group: o.group,
      },
      access: {
        create: o.createAdminOrHead
          ? governedCreateAdminOrHead
          : o.createAdminOnly
            ? governedCreateAdminOnly
            : governedCreate,
        delete: governedDelete,
        read: governedReadFor(o.slug),
        readVersions: governedReadVersionsFor(o.slug),
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
  label: 'Address on the old site',
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
    {
      name: 'label',
      label: 'Link text',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Say what the file is, for example "Prospectus 2026 (PDF)".' },
    },
    {
      name: 'url',
      label: 'Web address',
      type: 'text',
      required: true,
      validate: safeHrefValidate,
      admin: { description: 'Where the file is, starting with https://' },
    },
  ],
}

export const emailsField: Field = {
  name: 'emails',
  type: 'array',
  admin: { description: 'Published office or department addresses.' },
  fields: [{ name: 'email', type: 'email', required: true }],
}
