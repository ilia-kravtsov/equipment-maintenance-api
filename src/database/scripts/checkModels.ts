import 'dotenv/config';

import { logger } from '../../config/logger.js';
import { handleDatabaseScriptError } from '../handleDatabaseScriptError.js';
import { sequelize } from '../sequelize.js';
import { initModels } from '../models/initModels.js';
import { EquipmentModel } from '../models/equipmentModel.js';
import { MaintenanceRequestModel } from '../models/maintenanceRequestModel.js';

const checkModels = async (): Promise<void> => {
  try {
    initModels(sequelize);

    await sequelize.authenticate();

    const equipment = await EquipmentModel.findAll({
      attributes: [
        'id',
        'siteId',
        'name',
        'type',
        'serialNumber',
        'latitude',
        'longitude',
        'status',
        'installedAt',
        'deletedAt',
      ],
      include: [
        {
          association: 'site',
          attributes: [
            'id',
            'name',
            'code',
            'region',
            'latitude',
            'longitude',
          ],
        },
        {
          association: 'passport',
          attributes: [
            'equipmentId',
            'manufacturer',
            'model',
            'ratedPowerKw',
            'lastVerifiedAt',
          ],
        },
      ],
      limit: 1,
    });

    logger.info(
      { rows: equipment.length },
      'Equipment model and associations checked',
    );

    const requests = await MaintenanceRequestModel.findAll({
      attributes: [
        'id',
        'equipmentId',
        'title',
        'description',
        'priority',
        'status',
        'plannedAt',
        'createdBy',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
      include: [
        {
          association: 'equipment',
          attributes: ['id', 'name'],
        },
        {
          association: 'statusHistory',
          attributes: [
            'id',
            'requestId',
            'previousStatus',
            'newStatus',
            'changedBy',
            'comment',
            'changedAt',
          ],
        },
        {
          association: 'assignments',
          attributes: [
            'requestId',
            'technicianId',
            'role',
            'hours',
          ],
          include: [
            {
              association: 'technician',
              attributes: [
                'id',
                'fullName',
                'specialization',
                'employeeNumber',
              ],
            },
          ],
        },
        {
          association: 'technicians',
          attributes: [
            'id',
            'fullName',
            'specialization',
            'employeeNumber',
          ],
          through: {
            attributes: ['role', 'hours'],
          },
        },
      ],
      limit: 1,
    });

    logger.info(
      { rows: requests.length },
      'Maintenance request model and associations checked',
    );

    logger.info('Database model checks completed');
  } finally {
    await sequelize.close();
  }
};

checkModels().catch((error: unknown) => {
  handleDatabaseScriptError(error, 'Database model checks failed');
});