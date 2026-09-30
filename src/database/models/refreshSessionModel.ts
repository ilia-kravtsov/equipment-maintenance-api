import {
  DataTypes,
  Model,
  literal,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from 'sequelize';

export class RefreshSessionModel extends Model<
  InferAttributes<RefreshSessionModel>,
  InferCreationAttributes<RefreshSessionModel>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare revokedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const initRefreshSessionModel = (sequelize: Sequelize): void => {
  RefreshSessionModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: literal('gen_random_uuid()'),
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: 'token_hash',
        unique: 'refresh_sessions_token_hash_unique',
        validate: {
          is: /^[0-9a-f]{64}$/,
        },
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at',
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
      modelName: 'RefreshSession',
      tableName: 'refresh_sessions',
      timestamps: true,
      indexes: [
        {
          name: 'refresh_sessions_user_id_idx',
          fields: ['user_id'],
        },
        {
          name: 'refresh_sessions_expires_at_idx',
          fields: ['expires_at'],
        },
      ],
    },
  );
};