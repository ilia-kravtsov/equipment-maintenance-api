import { DataTypes, literal } from 'sequelize';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'technicians',
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: literal('gen_random_uuid()'),
        },
        full_name: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        specialization: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        employee_number: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('technicians', {
      fields: ['employee_number'],
      type: 'unique',
      name: 'technicians_employee_number_unique',
      transaction,
    });
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('technicians', { transaction });
  });
};