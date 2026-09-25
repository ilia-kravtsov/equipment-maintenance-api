import { DataTypes, literal, Op } from 'sequelize';
import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'request_status_history',
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: literal('gen_random_uuid()'),
        },
        request_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'maintenance_requests',
            key: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT',
        },
        previous_status: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        new_status: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        changed_by: {
          type: DataTypes.STRING(200),
          allowNull: false,
          defaultValue: 'api-client',
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        changed_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('request_status_history', {
      fields: ['previous_status'],
      type: 'check',
      name: 'request_status_history_previous_status_allowed',
      where: {
        previous_status: {
          [Op.in]: ['new', 'in_progress', 'done', 'rejected'],
        },
      },
      transaction,
    });

    await queryInterface.addConstraint('request_status_history', {
      fields: ['new_status'],
      type: 'check',
      name: 'request_status_history_new_status_allowed',
      where: {
        new_status: {
          [Op.in]: ['new', 'in_progress', 'done', 'rejected'],
        },
      },
      transaction,
    });
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('request_status_history', {
      transaction,
    });
  });
};