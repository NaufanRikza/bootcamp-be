import { DataTypes, Optional } from 'sequelize';
import BaseModel, { BaseModelAttributes, baseModelConfig, baseModelInit } from './base.model';
import Product from './products.model';

// Branch Interface
export interface BranchAttributes extends BaseModelAttributes {
  name: string;
  latitude: string;
  longitude: string;
  address: string;
  provinceId?: number;
  cityId?: number;
}

export interface BranchCreationAttributes extends Optional<BranchAttributes, 'id'> {}

// Sequelize Model
class Branch extends BaseModel<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  public name!: string;
  public latitude!: string;
  public longitude!: string;
  public address!: string;
  public provinceId!: number;
  public cityId!: number;
}

Branch.init(
  {
    ...baseModelInit,
    name: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    latitude: {
      type: new DataTypes.STRING(20),
      allowNull: false,
    },
    longitude: {
      type: new DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    provinceId: {
      type: new DataTypes.INTEGER(),
      allowNull: true,
    },
    cityId: {
      type: new DataTypes.INTEGER(),
      allowNull: true,
    },
  },
  {
    ...baseModelConfig,
    tableName: 'branches',
  }
);

Branch.hasMany(Product, {
  sourceKey: 'id',
  foreignKey: 'branchId',
  as: 'product',
});

Product.belongsTo(Branch, {
  foreignKey: 'branchId',
  as: 'branch',
});

export default Branch;
