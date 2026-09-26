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
  equipmentStatuses,
  equipmentTypes,
  type EquipmentStatus,
  type EquipmentType,
} from '../../models/equipment.js';

export class EquipmentModel extends Model<
  InferAttributes<EquipmentModel>,
  InferCreationAttributes<EquipmentModel>
> {
  declare id: CreationOptional<string>;
  declare siteId: string | null;
  declare name: string;
  declare type: EquipmentType;
  declare serialNumber: string;
  declare latitude: number;
  declare longitude: number;
  declare status: EquipmentStatus;
  declare installedAt: string;
  declare deletedAt: Date | null;
}

export const initEquipmentModel = (sequelize: Sequelize): void => {
  EquipmentModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: literal('gen_random_uuid()'),
      },
      siteId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'site_id',
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
        validate: {
          isIn: [[...equipmentTypes]],
        },
      },
      serialNumber: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: 'equipment_serial_number_unique',
        field: 'serial_number',
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          min: -90,
          max: 90,
        },
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          min: -180,
          max: 180,
        },
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isIn: [[...equipmentStatuses]],
        },
      },
      installedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'installed_at',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
      },
    },
    {
      sequelize,
      modelName: 'Equipment',
      tableName: 'equipment',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      deletedAt: 'deletedAt',
      paranoid: true,
    },
  );
};