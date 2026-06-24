import * as migration_20260617_115704_initial from './20260617_115704_initial';
import * as migration_20260622_000000_asset_cover_and_custom_category from './20260622_000000_asset_cover_and_custom_category';
import * as migration_20260624_112942_phase2_orders_delivery from './20260624_112942_phase2_orders_delivery';

export const migrations = [
  {
    up: migration_20260617_115704_initial.up,
    down: migration_20260617_115704_initial.down,
    name: '20260617_115704_initial',
  },
  {
    up: migration_20260622_000000_asset_cover_and_custom_category.up,
    down: migration_20260622_000000_asset_cover_and_custom_category.down,
    name: '20260622_000000_asset_cover_and_custom_category',
  },
  {
    up: migration_20260624_112942_phase2_orders_delivery.up,
    down: migration_20260624_112942_phase2_orders_delivery.down,
    name: '20260624_112942_phase2_orders_delivery'
  },
];
