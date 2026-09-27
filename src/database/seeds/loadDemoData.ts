import { QueryTypes, Transaction, type Sequelize } from 'sequelize';

import { siteSeeds } from './data/sites.js';
import { equipmentSeeds } from './data/equipment.js';
import { equipmentPassportSeeds } from './data/equipmentPassports.js';
import { technicianSeeds } from './data/technicians.js';
import { maintenanceRequestSeeds } from './data/maintenanceRequests.js';
import { requestAssigneeSeeds } from './data/requestAssignees.js';
import { requestStatusHistorySeeds } from './data/requestStatusHistory.js';
import { validateSeedData } from './validation/validateSeedData.js';

const seedName = 'demo-data-v1';

export const loadDemoData = async (
  sequelize: Sequelize,
): Promise<'applied' | 'skipped'> => {
  validateSeedData();

  const queryInterface = sequelize.getQueryInterface();

  return sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
    async (transaction) => {
      await sequelize.query(
        'LOCK TABLE public.seed_runs IN EXCLUSIVE MODE',
        { transaction },
      );

      const executed = await sequelize.query<{ name: string }>(
        'SELECT name FROM public.seed_runs WHERE name = $name',
        {
          bind: { name: seedName },
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      if (executed.length > 0) {
        return 'skipped';
      }

      await queryInterface.bulkInsert('sites', siteSeeds, {
        transaction,
      });

      await queryInterface.bulkInsert('equipment', equipmentSeeds, {
        transaction,
      });

      await queryInterface.bulkInsert(
        'equipment_passports',
        equipmentPassportSeeds,
        { transaction },
      );

      await queryInterface.bulkInsert('technicians', technicianSeeds, {
        transaction,
      });

      await queryInterface.bulkInsert(
        'maintenance_requests',
        maintenanceRequestSeeds,
        { transaction },
      );

      await queryInterface.bulkInsert(
        'request_assignees',
        requestAssigneeSeeds,
        { transaction },
      );

      await queryInterface.bulkInsert(
        'request_status_history',
        requestStatusHistorySeeds,
        { transaction },
      );

      await sequelize.query(
        'INSERT INTO public.seed_runs (name) VALUES ($name)',
        {
          bind: { name: seedName },
          transaction,
        },
      );

      return 'applied';
    },
  );
};