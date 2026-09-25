import { DataTypes, literal, Op } from 'sequelize';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'maintenance_requests',
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: literal('gen_random_uuid()'),
        },
        equipment_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'equipment',
            key: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        title: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING(2000),
          allowNull: true,
        },
        priority: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'new',
        },
        planned_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_by: {
          type: DataTypes.STRING(200),
          allowNull: false,
          defaultValue: 'api-client',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('maintenance_requests', {
      fields: ['priority'],
      type: 'check',
      name: 'maintenance_requests_priority_allowed',
      where: {
        priority: {
          [Op.in]: ['low', 'medium', 'high', 'critical'],
        },
      },
      transaction,
    });

    await queryInterface.addConstraint('maintenance_requests', {
      fields: ['status'],
      type: 'check',
      name: 'maintenance_requests_status_allowed',
      where: {
        status: {
          [Op.in]: ['new', 'in_progress', 'done', 'rejected'],
        },
      },
      transaction,
    });
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('maintenance_requests', {
      transaction,
    });
  });
};