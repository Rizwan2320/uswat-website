import * as migration_20261106_113628_initial from './20261106_113628_initial';
import * as migration_20261109_013938_p3a_governance from './20261109_013938_p3a_governance';
import * as migration_20261109_115039_p3b_governed_collections from './20261109_115039_p3b_governed_collections';

export const migrations = [
  {
    up: migration_20261106_113628_initial.up,
    down: migration_20261106_113628_initial.down,
    name: '20261106_113628_initial',
  },
  {
    up: migration_20261109_013938_p3a_governance.up,
    down: migration_20261109_013938_p3a_governance.down,
    name: '20261109_013938_p3a_governance',
  },
  {
    up: migration_20261109_115039_p3b_governed_collections.up,
    down: migration_20261109_115039_p3b_governed_collections.down,
    name: '20261109_115039_p3b_governed_collections'
  },
];
