import { DataTypes } from 'sequelize';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
      'equipment',
      'deleted_at',
      {
        type: DataTypes.DATE,
        allowNull: true,
      },
      { transaction },
    );
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeColumn(
      'equipment',
      'deleted_at',
      { transaction },
    );
  });
};