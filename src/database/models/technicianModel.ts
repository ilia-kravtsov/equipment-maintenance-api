import {
  DataTypes,
  Model,
  literal,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from 'sequelize';

export class TechnicianModel extends Model<
  InferAttributes<TechnicianModel>,
  InferCreationAttributes<TechnicianModel>
> {
  declare id: CreationOptional<string>;
  declare fullName: string;
  declare specialization: string;
  declare employeeNumber: string;
}

export const initTechnicianModel = (sequelize: Sequelize): void => {
  TechnicianModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: literal('gen_random_uuid()'),
      },
      fullName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'full_name',
      },
      specialization: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      employeeNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: 'technicians_employee_number_unique',
        field: 'employee_number',
      },
    },
    {
      sequelize,
      modelName: 'Technician',
      tableName: 'technicians',
      timestamps: false,
    },
  );
};