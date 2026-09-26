import { DataTypes, Op } from 'sequelize';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'request_assignees',
      {
        request_id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'maintenance_requests',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        technician_id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'technicians',
            key: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        role: {
          type: DataTypes.STRING(10),
          allowNull: false,
        },
        hours: {
          type: DataTypes.DECIMAL(8, 2),
          allowNull: false,
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('request_assignees', {
      fields: ['role'],
      type: 'check',
      name: 'request_assignees_role_allowed',
      where: {
        role: {
          [Op.in]: ['lead', 'member'],
        },
      },
      transaction,
    });

    await queryInterface.addConstraint('request_assignees', {
      fields: ['hours'],
      type: 'check',
      name: 'request_assignees_hours_range',
      where: {
        hours: {
          [Op.gte]: 0,
          [Op.lte]: 999999.99,
        },
      },
      transaction,
    });

    await queryInterface.addIndex('request_assignees', {
      fields: ['request_id'],
      unique: true,
      name: 'request_assignees_one_lead_per_request',
      where: {
        role: 'lead',
      },
      transaction,
    });
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('request_assignees', {
      transaction,
    });
  });
};