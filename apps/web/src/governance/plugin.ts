import type { Config, Plugin } from 'payload'

import { AUDIT_EXCLUDED, auditAfterChange, auditAfterDelete, auditGlobalAfterChange } from './audit'
import { COLLECTION_ACCESS, GLOBAL_ACCESS } from './staffAccess'

/**
 * Last plugin in the list, so it also covers collections added by other plugins:
 * 1. applies the role rules for ungoverned collections and globals (staffAccess.ts);
 * 2. adds audit hooks to every collection and global that is not excluded (audit.ts).
 */
export const governancePlugin: Plugin = (config: Config): Config => ({
  ...config,
  collections: (config.collections ?? []).map((original) => {
    const rule = COLLECTION_ACCESS[original.slug]
    const collection = rule ? { ...original, access: { ...original.access, ...rule } } : original
    if (AUDIT_EXCLUDED.has(collection.slug)) return collection
    return {
      ...collection,
      hooks: {
        ...collection.hooks,
        afterChange: [...(collection.hooks?.afterChange ?? []), auditAfterChange(collection.slug)],
        afterDelete: [...(collection.hooks?.afterDelete ?? []), auditAfterDelete(collection.slug)],
      },
    }
  }),
  globals: (config.globals ?? []).map((original) => {
    const rule = GLOBAL_ACCESS[original.slug]
    const global = rule ? { ...original, access: { ...original.access, ...rule } } : original
    return {
      ...global,
      hooks: {
        ...global.hooks,
        afterChange: [...(global.hooks?.afterChange ?? []), auditGlobalAfterChange(global.slug)],
      },
    }
  }),
})
