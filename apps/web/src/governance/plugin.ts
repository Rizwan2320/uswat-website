import type { Config, Plugin } from 'payload'

import { AUDIT_EXCLUDED, auditAfterChange, auditAfterDelete, auditGlobalAfterChange } from './audit'

/**
 * Adds audit hooks to every collection and global that is not excluded.
 * Runs last in the plugin list so it also covers collections added by other plugins.
 */
export const governancePlugin: Plugin = (config: Config): Config => ({
  ...config,
  collections: (config.collections ?? []).map((collection) =>
    AUDIT_EXCLUDED.has(collection.slug)
      ? collection
      : {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
              ...(collection.hooks?.afterChange ?? []),
              auditAfterChange(collection.slug),
            ],
            afterDelete: [
              ...(collection.hooks?.afterDelete ?? []),
              auditAfterDelete(collection.slug),
            ],
          },
        },
  ),
  globals: (config.globals ?? []).map((global) => ({
    ...global,
    hooks: {
      ...global.hooks,
      afterChange: [...(global.hooks?.afterChange ?? []), auditGlobalAfterChange(global.slug)],
    },
  })),
})
