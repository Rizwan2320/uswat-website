import * as migration_20261106_113628_initial from './20261106_113628_initial';
import * as migration_20261109_013938_p3a_governance from './20261109_013938_p3a_governance';
import * as migration_20261109_115039_p3b_governed_collections from './20261109_115039_p3b_governed_collections';
import * as migration_20261109_170317_p3c_lifecycle from './20261109_170317_p3c_lifecycle';
import * as migration_20261110_021434_p3d_post_types from './20261110_021434_p3d_post_types';
import * as migration_20261110_023005_p3e_organisation from './20261110_023005_p3e_organisation';
import * as migration_20261111_014816_p3f_media_rules from './20261111_014816_p3f_media_rules';
import * as migration_20261111_102441_p3h_seo_search_redirects from './20261111_102441_p3h_seo_search_redirects';

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
    name: '20261109_115039_p3b_governed_collections',
  },
  {
    up: migration_20261109_170317_p3c_lifecycle.up,
    down: migration_20261109_170317_p3c_lifecycle.down,
    name: '20261109_170317_p3c_lifecycle',
  },
  {
    up: migration_20261110_021434_p3d_post_types.up,
    down: migration_20261110_021434_p3d_post_types.down,
    name: '20261110_021434_p3d_post_types',
  },
  {
    up: migration_20261110_023005_p3e_organisation.up,
    down: migration_20261110_023005_p3e_organisation.down,
    name: '20261110_023005_p3e_organisation',
  },
  {
    up: migration_20261111_014816_p3f_media_rules.up,
    down: migration_20261111_014816_p3f_media_rules.down,
    name: '20261111_014816_p3f_media_rules',
  },
  {
    up: migration_20261111_102441_p3h_seo_search_redirects.up,
    down: migration_20261111_102441_p3h_seo_search_redirects.down,
    name: '20261111_102441_p3h_seo_search_redirects'
  },
];
