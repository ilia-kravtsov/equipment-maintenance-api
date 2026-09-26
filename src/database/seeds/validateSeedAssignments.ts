import assert from 'node:assert/strict';

import { maintenanceRequestSeeds } from './data/maintenanceRequests.js';
import { requestAssigneeSeeds } from './data/requestAssignees.js';
import { technicianSeeds } from './data/technicians.js';

export const validateSeedAssignments = (): void => {
  assert.equal(requestAssigneeSeeds.length, 40, 'Expected 40 assignments');

  const requestIds = new Set(maintenanceRequestSeeds.map((row) => row.id));
  const technicianIds = new Set(technicianSeeds.map((row) => row.id));
  const assignmentPairs = new Set<string>();

  for (const assignment of requestAssigneeSeeds) {
    assert.ok(
      requestIds.has(assignment.request_id),
      `Unknown request in assignment: ${assignment.request_id}`,
    );
    assert.ok(
      technicianIds.has(assignment.technician_id),
      `Unknown technician: ${assignment.technician_id}`,
    );

    const pair = `${assignment.request_id}:${assignment.technician_id}`;

    assert.ok(!assignmentPairs.has(pair), `Duplicate assignment: ${pair}`);
    assignmentPairs.add(pair);

    assert.ok(
      assignment.role === 'lead' || assignment.role === 'member',
      `Invalid crew role: ${pair}`,
    );

    assert.match(
      assignment.hours,
      /^\d{1,6}(\.\d{1,2})?$/,
      `Invalid planned hours: ${pair}`,
    );
  }

  for (const request of maintenanceRequestSeeds) {
    const crew = requestAssigneeSeeds.filter(
      (row) => row.request_id === request.id,
    );

    if (request.status === 'in_progress' || request.status === 'done') {
      assert.ok(crew.length > 0, `Missing crew: ${request.id}`);
    }

    if (crew.length > 0) {
      assert.equal(
        crew.filter((row) => row.role === 'lead').length,
        1,
        `Expected exactly one lead: ${request.id}`,
      );
    }
  }
};