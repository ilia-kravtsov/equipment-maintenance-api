import { DataTypes, literal } from 'sequelize';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'seed_runs',
      {
        name: {
          type: DataTypes.STRING(200),
          allowNull: false,
          primaryKey: true,
        },
        executed_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      },
      { transaction },
    );
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('seed_runs', { transaction });
  });
};