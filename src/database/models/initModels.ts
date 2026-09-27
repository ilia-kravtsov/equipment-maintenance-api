import type { Sequelize } from 'sequelize';

import { initSiteModel } from './siteModel.js';
import { initEquipmentModel } from './equipmentModel.js';
import { initEquipmentPassportModel } from './equipmentPassportModel.js';
import { initTechnicianModel } from './technicianModel.js';
import { initMaintenanceRequestModel } from './maintenanceRequestModel.js';
import { initRequestStatusHistoryModel } from './requestStatusHistoryModel.js';
import { initRequestAssigneeModel } from './requestAssigneeModel.js';
import { associateModels } from './associateModels.js';

let initializedSequelize: Sequelize | undefined;

export const initModels = (sequelize: Sequelize): void => {
  if (initializedSequelize === sequelize) {
    return;
  }

  if (initializedSequelize !== undefined) {
    throw new Error(
      'Models have already been initialized with another Sequelize instance',
    );
  }

  initSiteModel(sequelize);
  initEquipmentModel(sequelize);
  initEquipmentPassportModel(sequelize);
  initTechnicianModel(sequelize);
  initMaintenanceRequestModel(sequelize);
  initRequestStatusHistoryModel(sequelize);
  initRequestAssigneeModel(sequelize);

  associateModels();

  initializedSequelize = sequelize;
};