import 'dotenv/config';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { logger } from '../../config/logger.js';
import { ConflictError } from '../../errors/conflictError.js';
import type { Equipment } from '../../models/equipment/equipment.js';
import { PostgresEquipmentRepository } from '../../repositories/postgres/equipment/postgresEquipmentRepository.js';
import { handleDatabaseScriptError } from '../handleDatabaseScriptError.js';
import { EquipmentModel } from '../models/equipmentModel.js';
import { initModels } from '../models/initModels.js';
import { sequelize } from '../sequelize.js';

const checkEquipmentRepository = async (): Promise<void> => {
  const id = randomUUID();

  try {
    initModels(sequelize);
    await sequelize.authenticate();

    const repository = new PostgresEquipmentRepository(sequelize);

    const query = {
      type: 'sensor',
      page: 1,
      limit: 2,
      sortBy: 'installedAt',
      order: 'asc',
    } as const;

    const firstPage = await repository.findAll(query);
    const secondPage = await repository.findAll({ ...query, page: 2 });

    assert.equal(firstPage.data.length, 2);
    assert.ok(firstPage.meta.total >= 3);
    assert.equal(firstPage.meta.total, secondPage.meta.total);
    assert.ok(firstPage.data.every((item) => item.type === 'sensor'));
    assert.ok(secondPage.data.every((item) => item.type === 'sensor'));

    const dates = [...firstPage.data, ...secondPage.data].map(
      (item) => item.installedAt,
    );
    assert.deepEqual(dates, [...dates].sort());

    const firstPageIds = new Set(firstPage.data.map((item) => item.id));
    assert.ok(secondPage.data.every((item) => !firstPageIds.has(item.id)));

    const equipment: Equipment = {
      id,
      name: 'Проверочный датчик',
      type: 'sensor',
      serialNumber: `CHECK-${id}`,
      location: { lat: 55.75, lon: 37.62 },
      status: 'operational',
      installedAt: '2026-01-15',
    };

    assert.deepEqual(await repository.create(equipment), equipment);
    assert.deepEqual(await repository.findById(id), equipment);
    assert.deepEqual(
      await repository.findBySerialNumber(equipment.serialNumber),
      equipment,
    );

    await assert.rejects(
      () => repository.create({ ...equipment, id: randomUUID() }),
      ConflictError,
    );

    const updated: Equipment = {
      ...equipment,
      name: 'Датчик после проверки',
      status: 'maintenance',
    };

    assert.deepEqual(await repository.update(id, updated), updated);
    assert.deepEqual(await repository.findById(id), updated);

    const protectedEquipment =
      await repository.findBySerialNumber('NORTH-TRB-001');

    assert.ok(protectedEquipment, 'Expected seeded equipment NORTH-TRB-001');

    await assert.rejects(
      () => repository.delete(protectedEquipment.id),
      ConflictError,
    );
    assert.ok(await repository.findById(protectedEquipment.id));

    assert.equal(await repository.delete(id), true);
    assert.equal(await repository.findById(id), undefined);
    assert.equal(await repository.delete(id), false);

    const stored = await EquipmentModel.findByPk(id, {
      attributes: ['id', 'deletedAt'],
      paranoid: false,
    });

    assert.ok(stored?.deletedAt instanceof Date);
    assert.ok(await repository.findBySerialNumber(equipment.serialNumber));

    logger.info('Equipment repository checks passed');
  } finally {
    try {
      if (EquipmentModel.sequelize === sequelize) {
        await EquipmentModel.destroy({ where: { id } });
      }
    } finally {
      await sequelize.close();
    }
  }
};

checkEquipmentRepository().catch((error: unknown) => {
  handleDatabaseScriptError(error, 'Equipment repository checks failed');
});