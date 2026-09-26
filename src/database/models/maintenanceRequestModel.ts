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
  requestPriorities,
  requestStatuses,
  type RequestPriority,
  type RequestStatus,
} from '../../models/maintenanceRequest.js';

export class MaintenanceRequestModel extends Model<
  InferAttributes<MaintenanceRequestModel>,
  InferCreationAttributes<MaintenanceRequestModel>
> {
  declare id: CreationOptional<string>;
  declare equipmentId: string;
  declare title: string;
  declare description: string | null;
  declare priority: RequestPriority;
  declare status: CreationOptional<RequestStatus>;
  declare plannedAt: Date | null;
  declare createdBy: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: Date | null;
}

export const initMaintenanceRequestModel = (
  sequelize: Sequelize,
): void => {
  MaintenanceRequestModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: literal('gen_random_uuid()'),
      },
      equipmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'equipment_id',
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
        validate: {
          isIn: [[...requestPriorities]],
        },
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'new',
        validate: {
          isIn: [[...requestStatuses]],
        },
      },
      plannedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'planned_at',
      },
      createdBy: {
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue: 'api-client',
        field: 'created_by',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
      },
    },
    {
      sequelize,
      modelName: 'MaintenanceRequest',
      tableName: 'maintenance_requests',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      deletedAt: 'deletedAt',
      paranoid: true,
    },
  );
};