import { randomUUID } from 'node:crypto';

import { EquipmentModel } from '../../src/database/models/equipmentModel.js';
import { initModels } from '../../src/database/models/initModels.js';
import { sequelize } from '../../src/database/sequelize.js';
import { ConflictError } from '../../src/errors/conflictError.js';
import type { CreateSiteInput } from '../../src/models/sites/site.js';
import { PostgresSiteRepository } from '../../src/repositories/postgres/sites/postgresSiteRepository.js';

initModels(sequelize);

const repository = new PostgresSiteRepository();

const createInput = (): CreateSiteInput => ({
  name: 'Test site',
  code: `SITE-${randomUUID()}`,
  region: 'Test region',
  latitude: 55.7558,
  longitude: 37.6173,
});

describe('PostgresSiteRepository', () => {
  it('creates and finds a site', async () => {
    const input = createInput();
    const created = await repository.create(input);

    expect(created).toEqual({
      id: expect.any(String),
      ...input,
    });

    expect(await repository.findById(created.id)).toEqual(created);
  });

  it('includes created sites in the list', async () => {
    const first = await repository.create(createInput());
    const second = await repository.create(createInput());

    expect(await repository.findAll()).toEqual(
      expect.arrayContaining([first, second]),
    );
  });

  it('updates supplied fields and preserves other fields', async () => {
    const created = await repository.create(createInput());

    const updated = await repository.update(created.id, {
      name: 'Updated site',
      latitude: 0,
    });

    const expected = {
      ...created,
      name: 'Updated site',
      latitude: 0,
    };

    expect(updated).toEqual(expected);
    expect(await repository.findById(created.id)).toEqual(expected);
  });

  it('deletes an unlinked site', async () => {
    const created = await repository.create(createInput());

    expect(await repository.delete(created.id)).toBe(true);
    expect(await repository.findById(created.id)).toBeUndefined();
    expect(await repository.delete(created.id)).toBe(false);
  });

  it('handles an unknown site', async () => {
    const id = randomUUID();

    expect(await repository.findById(id)).toBeUndefined();

    expect(
      await repository.update(id, { name: 'Missing site' }),
    ).toBeUndefined();

    expect(await repository.delete(id)).toBe(false);
  });

  it('rejects a duplicate code on creation', async () => {
    const input = createInput();
    const created = await repository.create(input);

    await expect(
      repository.create({
        ...input,
        name: 'Duplicate site',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(await repository.findById(created.id)).toEqual(created);
  });

  it('rejects a duplicate code on update without changing the site', async () => {
    const first = await repository.create(createInput());
    const second = await repository.create(createInput());

    await expect(
      repository.update(second.id, {
        code: first.code,
        name: 'Rejected update',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(await repository.findById(second.id)).toEqual(second);
  });

  it.each([false, true])(
    'rejects deletion when linked equipment has soft delete = %s',
    async (softDeleted) => {
      const site = await repository.create(createInput());

      const equipment = await EquipmentModel.create({
        siteId: site.id,
        name: 'Linked test sensor',
        type: 'sensor',
        serialNumber: `SITE-LINK-${randomUUID()}`,
        latitude: site.latitude,
        longitude: site.longitude,
        status: 'operational',
        installedAt: '2025-01-15',
        deletedAt: null,
      });

      if (softDeleted) {
        await equipment.destroy();
      }

      await expect(
        repository.delete(site.id),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(await repository.findById(site.id)).toEqual(site);

      const storedEquipment = await EquipmentModel.findByPk(
        equipment.id,
        { paranoid: false },
      );

      expect(storedEquipment?.siteId).toBe(site.id);
    },
  );
});