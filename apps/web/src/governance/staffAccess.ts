/**
 * Role rules for collections and globals that are not governed records: categories, media,
 * redirects, forms, form submissions, media folders, header and footer (plan v2 7.3).
 *
 * The template lets any signed-in user write these. Here: site manager and platform admin own
 * navigation, redirects, forms and categories; any staff except the auditor may upload media, but only reviewers (approver and above) may change one;
 * the auditor edits nothing. Applied by the governance plugin so plugin-made collections are
 * covered too. The matrix test (tests/int/access.matrix.int.spec.ts) checks every entry.
 */

import type { Access, CollectionConfig, GlobalConfig } from 'payload'

import { actorFromRequest, type Role } from './roles'

const roles =
  (...allowed: Role[]): Access =>
  ({ req }) => {
    const actor = actorFromRequest(req)
    return actor.kind === 'user' && allowed.includes(actor.role)
  }

const admins = roles('platformAdmin', 'siteManager')
const staff = roles('platformAdmin', 'siteManager', 'approver', 'editor', 'contributor')
const reviewers = roles('platformAdmin', 'siteManager', 'approver')
const adminOnly = roles('platformAdmin')
const readers = roles('platformAdmin', 'siteManager', 'auditor')
const nobody: Access = () => false

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const COLLECTION_ACCESS: Record<string, Partial<CollectionAccess>> = {
  categories: { create: admins, update: admins, delete: admins },
  // Anyone on staff may upload (a draft needs a picture); changing a file that may already be on a
  // live page needs reviewer authority (main agent review of PR #2).
  media: { create: staff, update: reviewers, delete: admins },
  'payload-folders': { create: staff, update: reviewers, delete: admins },
  redirects: { create: admins, update: admins, delete: admins },
  forms: { create: admins, update: admins, delete: admins },
  // The public submits (create stays as the plugin defines it). Personal data: staff who
  // handle it or audit it may read; nobody edits a submission.
  'form-submissions': { read: readers, update: nobody, delete: adminOnly },
  // Written by the search plugin through the Local API only.
  search: { create: nobody, update: nobody, delete: nobody },
}

export const GLOBAL_ACCESS: Record<string, NonNullable<GlobalConfig['access']>> = {
  header: { update: admins },
  footer: { update: admins },
  // Written by Payload on every job run (the lifecycle sweep); operators may read it.
  'payload-jobs-stats': { read: admins, update: nobody },
}

/**
 * The media-folder collection is created by Payload itself after plugins run, so its rule is
 * applied through the root `folders.collectionOverrides` option instead of the plugin.
 */
export const folderAccessOverride = <T extends { access?: CollectionConfig['access'] }>({
  collection,
}: {
  collection: T
}): T => ({
  ...collection,
  access: { ...collection.access, ...COLLECTION_ACCESS['payload-folders'] },
})
