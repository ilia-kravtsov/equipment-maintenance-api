import { DataTypes, literal, Op } from 'sequelize';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'equipment',
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: literal('gen_random_uuid()'),
        },
        site_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'sites',
            key: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        serial_number: {
          type: DataTypes.TEXT,
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
        status: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        installed_at: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('equipment', {
      fields: ['serial_number'],
      type: 'unique',
      name: 'equipment_serial_number_unique',
      transaction,
    });

    await queryInterface.addConstraint('equipment', {
      fields: ['type'],
      type: 'check',
      name: 'equipment_type_allowed',
      where: {
        type: {
          [Op.in]: ['turbine', 'inverter', 'sensor', 'substation'],
        },
      },
      transaction,
    });

    await queryInterface.addConstraint('equipment', {
      fields: ['status'],
      type: 'check',
      name: 'equipment_status_allowed',
      where: {
        status: {
          [Op.in]: [
            'operational',
            'maintenance',
            'fault',
            'decommissioned',
          ],
        },
      },
      transaction,
    });

    await queryInterface.addConstraint('equipment', {
      fields: ['latitude'],
      type: 'check',
      name: 'equipment_latitude_range',
      where: {
        latitude: {
          [Op.between]: [-90, 90],
        },
      },
      transaction,
    });

    await queryInterface.addConstraint('equipment', {
      fields: ['longitude'],
      type: 'check',
      name: 'equipment_longitude_range',
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
    await queryInterface.dropTable('equipment', { transaction });
  });
};