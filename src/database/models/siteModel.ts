import {
  DataTypes,
  Model,
  literal,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from 'sequelize';

export class SiteModel extends Model<
  InferAttributes<SiteModel>,
  InferCreationAttributes<SiteModel>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare code: string;
  declare region: string;
  declare latitude: number;
  declare longitude: number;
}

export const initSiteModel = (sequelize: Sequelize): void => {
  SiteModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: literal('gen_random_uuid()'),
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: 'sites_code_unique',
      },
      region: {
        type: DataTypes.STRING(200),
        allowNull: false,
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
    },
    {
      sequelize,
      modelName: 'Site',
      tableName: 'sites',
      timestamps: false,
    },
  );
};