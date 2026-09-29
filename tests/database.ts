import { QueryTypes } from 'sequelize';

import { createAdminSequelize } from '../src/database/createAdminSequelize.js';

export const testAdminSequelize = createAdminSequelize();

export const resetTestDatabase = async (): Promise<void> => {
  if (
    process.env.NODE_ENV !== 'test' ||
    process.env.DB_NAME !== 'equipment_maintenance_test'
  ) {
    throw new Error('Database cleanup is allowed only in the test database');
  }

  const [connection] = await testAdminSequelize.query<{
    database: string;
  }>('SELECT current_database() AS database', {
    type: QueryTypes.SELECT,
  });

  if (connection?.database !== 'equipment_maintenance_test') {
    throw new Error('Refusing to clean a non-test database');
  }

  await testAdminSequelize.transaction(async (transaction) => {
    await testAdminSequelize.query(
      `ALTER TABLE public.request_status_history
       DISABLE TRIGGER USER`,
      { transaction },
    );

    await testAdminSequelize.query(
      `TRUNCATE TABLE
         public.refresh_sessions,
         public.users,
         public.request_status_history,
         public.request_assignees,
         public.maintenance_requests,
         public.equipment_passports,
         public.equipment,
         public.technicians,
         public.sites`,
      { transaction },
    );

    await testAdminSequelize.query(
      `ALTER TABLE public.request_status_history
       ENABLE TRIGGER USER`,
      { transaction },
    );
  });
};