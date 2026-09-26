import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from 'sequelize';

export type AssigneeRole = 'lead' | 'member';

export class RequestAssigneeModel extends Model<
  InferAttributes<RequestAssigneeModel>,
  InferCreationAttributes<RequestAssigneeModel>
> {
  declare requestId: string;
  declare technicianId: string;
  declare role: AssigneeRole;
  declare hours: string;
}

export const initRequestAssigneeModel = (sequelize: Sequelize): void => {
  RequestAssigneeModel.init(
    {
      requestId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: 'request_id',
        references: {
          model: 'maintenance_requests',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      technicianId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: 'technician_id',
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
        validate: {
          isIn: [['lead', 'member']],
        },
      },
      hours: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: 0,
          max: 999999.99,
        },
      },
    },
    {
      sequelize,
      modelName: 'RequestAssignee',
      tableName: 'request_assignees',
      timestamps: false,
      indexes: [
        {
          name: 'request_assignees_one_lead_per_request',
          unique: true,
          fields: ['request_id'],
          where: {
            role: 'lead',
          },
        },
      ],
    },
  );
};