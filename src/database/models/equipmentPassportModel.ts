import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from 'sequelize';

export class EquipmentPassportModel extends Model<
  InferAttributes<EquipmentPassportModel>,
  InferCreationAttributes<EquipmentPassportModel>
> {
  declare equipmentId: string;
  declare manufacturer: string;
  declare model: string;
  declare ratedPowerKw: string;
  declare lastVerifiedAt: string | null;
}

export const initEquipmentPassportModel = (sequelize: Sequelize): void => {
  EquipmentPassportModel.init(
    {
      equipmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: 'equipment_id',
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
      ratedPowerKw: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        field: 'rated_power_kw',
        validate: {
          isDecimal: true,
          min: 0,
          max: 999999999.999,
        },
      },
      lastVerifiedAt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'last_verified_at',
      },
    },
    {
      sequelize,
      modelName: 'EquipmentPassport',
      tableName: 'equipment_passports',
      timestamps: false,
    },
  );
};