import * as migration_20260617_115704_initial from './20260617_115704_initial';

export const migrations = [
  {
    up: migration_20260617_115704_initial.up,
    down: migration_20260617_115704_initial.down,
    name: '20260617_115704_initial'
  },
];
