import { DataTypes, Op } from 'sequelize';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'equipment_passports',
      {
        equipment_id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'equipment',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        manufacturer: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        model: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        rated_power_kw: {
          type: DataTypes.DECIMAL(12, 3),
          allowNull: false,
        },
        last_verified_at: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('equipment_passports', {
      fields: ['rated_power_kw'],
      type: 'check',
      name: 'equipment_passports_rated_power_nonnegative',
      where: {
        rated_power_kw: {
          [Op.gte]: 0,
          [Op.lte]: 999999999.999,
        },
      },
      transaction,
    });
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('equipment_passports', {
      transaction,
    });
  });
};