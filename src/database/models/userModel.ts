import {
  DataTypes,
  Model,
  literal,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from 'sequelize';

import { userRoles, type UserRole } from '../../models/user.js';

export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare passwordHash: string;
  declare role: CreationOptional<UserRole>;
  declare technicianId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const initUserModel = (sequelize: Sequelize): void => {
  UserModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: literal('gen_random_uuid()'),
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: 'users_email_unique',
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'viewer',
        validate: {
          isIn: [[...userRoles]],
        },
      },
      technicianId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'technician_id',
        unique: 'users_technician_id_unique',
        references: {
          model: 'technicians',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
    },
  );
};