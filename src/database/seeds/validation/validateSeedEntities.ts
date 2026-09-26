import assert from 'node:assert/strict';

import { siteSeeds } from '../data/sites.js';
import { equipmentSeeds } from '../data/equipment.js';
import { equipmentPassportSeeds } from '../data/equipmentPassports.js';
import { technicianSeeds } from '../data/technicians.js';
import { maintenanceRequestSeeds } from '../data/maintenanceRequests.js';

const assertUnique = (values: string[], description: string): void => {
  assert.equal(
    new Set(values).size,
    values.length,
    `Duplicate ${description}`,
  );
};

export const validateSeedEntities = (): void => {
  assert.equal(siteSeeds.length, 3, 'Expected 3 sites');
  assert.equal(equipmentSeeds.length, 11, 'Expected 11 equipment records');
  assert.equal(equipmentPassportSeeds.length, 11, 'Expected 11 passports');
  assert.equal(technicianSeeds.length, 9, 'Expected 9 technicians');
  assert.equal(maintenanceRequestSeeds.length, 34, 'Expected 34 requests');

  assertUnique(siteSeeds.map((row) => row.id), 'site IDs');
  assertUnique(siteSeeds.map((row) => row.code), 'site codes');
  assertUnique(equipmentSeeds.map((row) => row.id), 'equipment IDs');
  assertUnique(
    equipmentSeeds.map((row) => row.serial_number),
    'serial numbers',
  );
  assertUnique(
    equipmentPassportSeeds.map((row) => row.equipment_id),
    'equipment passports',
  );
  assertUnique(technicianSeeds.map((row) => row.id), 'technician IDs');
  assertUnique(
    technicianSeeds.map((row) => row.employee_number),
    'employee numbers',
  );
  assertUnique(maintenanceRequestSeeds.map((row) => row.id), 'request IDs');

  const siteIds = new Set(siteSeeds.map((row) => row.id));
  const equipmentIds = new Set(equipmentSeeds.map((row) => row.id));

  for (const equipment of equipmentSeeds) {
    assert.ok(
      siteIds.has(equipment.site_id),
      `Unknown site for equipment: ${equipment.id}`,
    );
  }

  for (const passport of equipmentPassportSeeds) {
    assert.ok(
      equipmentIds.has(passport.equipment_id),
      `Unknown equipment for passport: ${passport.equipment_id}`,
    );
  }

  for (const request of maintenanceRequestSeeds) {
    assert.ok(
      equipmentIds.has(request.equipment_id),
      `Unknown equipment for request: ${request.id}`,
    );
  }
};