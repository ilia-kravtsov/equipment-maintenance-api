import { SiteModel } from './siteModel.js';
import { EquipmentModel } from './equipmentModel.js';
import { EquipmentPassportModel } from './equipmentPassportModel.js';
import { TechnicianModel } from './technicianModel.js';
import { MaintenanceRequestModel } from './maintenanceRequestModel.js';
import { RequestStatusHistoryModel } from './requestStatusHistoryModel.js';
import { RequestAssigneeModel } from './requestAssigneeModel.js';

export const associateModels = (): void => {
  SiteModel.hasMany(EquipmentModel, {
    as: 'equipment',
    foreignKey: 'siteId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });

  EquipmentModel.belongsTo(SiteModel, {
    as: 'site',
    foreignKey: 'siteId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });

  EquipmentModel.hasOne(EquipmentPassportModel, {
    as: 'passport',
    foreignKey: 'equipmentId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  EquipmentPassportModel.belongsTo(EquipmentModel, {
    as: 'equipment',
    foreignKey: 'equipmentId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  EquipmentModel.hasMany(MaintenanceRequestModel, {
    as: 'requests',
    foreignKey: 'equipmentId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });

  MaintenanceRequestModel.belongsTo(EquipmentModel, {
    as: 'equipment',
    foreignKey: 'equipmentId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });

  MaintenanceRequestModel.hasMany(RequestStatusHistoryModel, {
    as: 'statusHistory',
    foreignKey: 'requestId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  RequestStatusHistoryModel.belongsTo(MaintenanceRequestModel, {
    as: 'request',
    foreignKey: 'requestId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  MaintenanceRequestModel.hasMany(RequestAssigneeModel, {
    as: 'assignments',
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  RequestAssigneeModel.belongsTo(MaintenanceRequestModel, {
    as: 'request',
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  TechnicianModel.hasMany(RequestAssigneeModel, {
    as: 'assignments',
    foreignKey: 'technicianId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });

  RequestAssigneeModel.belongsTo(TechnicianModel, {
    as: 'technician',
    foreignKey: 'technicianId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });

  MaintenanceRequestModel.belongsToMany(TechnicianModel, {
    as: 'technicians',
    through: {
      model: RequestAssigneeModel,
      unique: false,
    },
    foreignKey: 'requestId',
    otherKey: 'technicianId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  TechnicianModel.belongsToMany(MaintenanceRequestModel, {
    as: 'requests',
    through: {
      model: RequestAssigneeModel,
      unique: false,
    },
    foreignKey: 'technicianId',
    otherKey: 'requestId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
};