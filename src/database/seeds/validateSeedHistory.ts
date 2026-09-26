import assert from 'node:assert/strict';

import { maintenanceRequestSeeds } from './data/maintenanceRequests.js';
import { requestStatusHistorySeeds } from './data/requestStatusHistory.js';

export const validateSeedHistory = (): void => {
  assert.equal(requestStatusHistorySeeds.length, 70, 'Expected 70 events');

  const eventIds = new Set(requestStatusHistorySeeds.map((row) => row.id));
  const requestIds = new Set(maintenanceRequestSeeds.map((row) => row.id));

  assert.equal(
    eventIds.size,
    requestStatusHistorySeeds.length,
    'Duplicate history IDs',
  );

  for (const event of requestStatusHistorySeeds) {
    assert.ok(
      requestIds.has(event.request_id),
      `Unknown request in history: ${event.request_id}`,
    );
    assert.ok(
      Number.isFinite(event.changed_at.getTime()),
      `Invalid history event date: ${event.id}`,
    );
  }

  for (const request of maintenanceRequestSeeds) {
    const events = requestStatusHistorySeeds
      .filter((row) => row.request_id === request.id)
      .sort((a, b) => a.changed_at.getTime() - b.changed_at.getTime());

    const expectedStatuses =
      request.status === 'done'
        ? ['new', 'in_progress', 'done']
        : request.status === 'new'
          ? ['new']
          : ['new', request.status];

    assert.deepEqual(
      events.map((event) => event.new_status),
      expectedStatuses,
      `Invalid status history: ${request.id}`,
    );

    let previousStatus: string | null = null;
    let previousTime = Number.NEGATIVE_INFINITY;

    for (const event of events) {
      const time = event.changed_at.getTime();

      assert.equal(
        event.previous_status,
        previousStatus,
        `Broken status chain: ${request.id}`,
      );
      assert.ok(
        time > previousTime,
        `Invalid event chronology: ${request.id}`,
      );

      previousStatus = event.new_status;
      previousTime = time;
    }

    assert.equal(
      events[0]?.changed_at.getTime(),
      request.created_at.getTime(),
      `Creation time mismatch: ${request.id}`,
    );
    assert.equal(
      events.at(-1)?.changed_at.getTime(),
      request.updated_at.getTime(),
      `Last event time mismatch: ${request.id}`,
    );
  }
};