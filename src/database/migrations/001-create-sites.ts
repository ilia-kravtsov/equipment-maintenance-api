import { DataTypes, literal, Op } from 'sequelize';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'sites',
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: literal('gen_random_uuid()'),
        },
        name: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        code: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        region: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        latitude: {
          type: DataTypes.DOUBLE,
          allowNull: false,
        },
        longitude: {
          type: DataTypes.DOUBLE,
          allowNull: false,
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('sites', {
      fields: ['code'],
      type: 'unique',
      name: 'sites_code_unique',
      transaction,
    });

    await queryInterface.addConstraint('sites', {
      fields: ['latitude'],
      type: 'check',
      name: 'sites_latitude_range',
      where: {
        latitude: {
          [Op.between]: [-90, 90],
        },
      },
      transaction,
    });

    await queryInterface.addConstraint('sites', {
      fields: ['longitude'],
      type: 'check',
      name: 'sites_longitude_range',
      where: {
        longitude: {
          [Op.between]: [-180, 180],
        },
      },
      transaction,
    });
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('sites', { transaction });
  });
};