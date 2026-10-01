import { randomUUID } from 'node:crypto';

import { testAdminSequelize } from '../database.js';

export const assignTestTechnician = async (
  requestId: string,
): Promise<string> => {
  if (
    process.env.NODE_ENV !== 'test' ||
    testAdminSequelize.getDatabaseName() !== 'equipment_maintenance_test'
  ) {
    throw new Error('Test fixtures require the test database');
  }

  const technicianId = randomUUID();

  await testAdminSequelize.transaction(async (transaction) => {
    await testAdminSequelize.query(
      `INSERT INTO public.technicians
         (id, full_name, specialization, employee_number)
       VALUES ($id, $name, $specialization, $employeeNumber)`,
      {
        bind: {
          id: technicianId,
          name: 'Тестовый специалист',
          specialization: 'Обслуживание оборудования',
          employeeNumber: `TEST-${technicianId}`,
        },
        transaction,
      },
    );

    await testAdminSequelize.query(
      `INSERT INTO public.request_assignees
         (request_id, technician_id, role, hours)
       VALUES ($requestId, $technicianId, $role, $hours)`,
      {
        bind: {
          requestId,
          technicianId,
          role: 'lead',
          hours: '2.00',
        },
        transaction,
      },
    );
  });

  return technicianId;
};