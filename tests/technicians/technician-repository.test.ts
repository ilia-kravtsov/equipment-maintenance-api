import { randomUUID } from 'node:crypto';

import { initModels } from '../../src/database/models/initModels.js';
import { sequelize } from '../../src/database/sequelize.js';
import { ConflictError } from '../../src/errors/conflictError.js';
import { PostgresTechnicianRepository } from '../../src/repositories/postgres/technicians/postgresTechnicianRepository.js';

initModels(sequelize);

const repository = new PostgresTechnicianRepository();
const input = () => ({
  fullName: 'Test technician',
  specialization: 'Equipment maintenance',
  employeeNumber: randomUUID(),
});

describe('PostgresTechnicianRepository', () => {
  it('supports CRUD and preserves unchanged fields', async () => {
    const data = input();
    const created = await repository.create(data);

    expect(created).toEqual({ id: expect.any(String), ...data });
    expect(await repository.findById(created.id)).toEqual(created);
    expect(await repository.findAll()).toContainEqual(created);

    const expected = { ...created, fullName: 'Updated technician' };
    expect(
      await repository.update(created.id, { fullName: expected.fullName }),
    ).toEqual(expected);
    expect(await repository.findById(created.id)).toEqual(expected);

    expect(await repository.delete(created.id)).toBe(true);
    expect(await repository.findById(created.id)).toBeUndefined();
    expect(await repository.delete(created.id)).toBe(false);
  });

  it('handles an unknown technician', async () => {
    const id = randomUUID();

    expect(await repository.findById(id)).toBeUndefined();
    expect(
      await repository.update(id, { fullName: 'Missing technician' }),
    ).toBeUndefined();
    expect(await repository.delete(id)).toBe(false);
  });

  it('rejects a duplicate employee number on creation', async () => {
    const data = input();
    const created = await repository.create(data);

    await expect(repository.create(data))
      .rejects.toBeInstanceOf(ConflictError);

    expect(await repository.findById(created.id)).toEqual(created);
  });

  it('rejects a duplicate employee number on update', async () => {
    const first = await repository.create(input());
    const second = await repository.create(input());

    await expect(repository.update(second.id, {
      employeeNumber: first.employeeNumber,
      fullName: 'Rejected update',
    })).rejects.toBeInstanceOf(ConflictError);

    expect(await repository.findById(second.id)).toEqual(second);
  });
});