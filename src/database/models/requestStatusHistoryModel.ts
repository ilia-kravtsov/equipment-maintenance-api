import {
  DataTypes,
  Model,
  literal,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from 'sequelize';

import {
  requestStatuses,
  type RequestStatus,
} from '../../models/maintenanceRequest.js';

export class RequestStatusHistoryModel extends Model<
  InferAttributes<RequestStatusHistoryModel>,
  InferCreationAttributes<RequestStatusHistoryModel>
> {
  declare id: CreationOptional<string>;
  declare requestId: string;
  declare previousStatus: RequestStatus | null;
  declare newStatus: RequestStatus;
  declare changedBy: CreationOptional<string>;
  declare comment: string | null;
  declare changedAt: CreationOptional<Date>;
}

export const initRequestStatusHistoryModel = (
  sequelize: Sequelize,
): void => {
  RequestStatusHistoryModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: literal('gen_random_uuid()'),
      },
      requestId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'request_id',
        references: {
          model: 'maintenance_requests',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      },
      previousStatus: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'previous_status',
        validate: {
          isIn: [[...requestStatuses]],
        },
      },
      newStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'new_status',
        validate: {
          isIn: [[...requestStatuses]],
        },
      },
      changedBy: {
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue: 'api-client',
        field: 'changed_by',
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      changedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal('CURRENT_TIMESTAMP'),
        field: 'changed_at',
      },
    },
    {
      sequelize,
      modelName: 'RequestStatusHistory',
      tableName: 'request_status_history',
      timestamps: false,
    },
  );
};