import { setImmediate } from 'node:timers/promises';

import { waitForDatabase } from '../../src/database/waitForDatabase.js';

describe('waitForDatabase', () => {
  it('finishes after a successful connection', async () => {
    const authenticate = jest.fn<Promise<void>, []>()
      .mockResolvedValue(undefined);

    const controller = new AbortController();

    await waitForDatabase({ authenticate }, controller.signal);

    expect(authenticate).toHaveBeenCalledTimes(1);
  });

  it('retries after a connection failure', async () => {
    const authenticate = jest.fn<Promise<void>, []>()
      .mockRejectedValueOnce(new Error('Database unavailable'))
      .mockResolvedValue(undefined);

    const controller = new AbortController();

    await waitForDatabase({ authenticate }, controller.signal);

    expect(authenticate).toHaveBeenCalledTimes(2);
  });

  it('does not connect when already aborted', async () => {
    const authenticate = jest.fn<Promise<void>, []>();
    const controller = new AbortController();

    controller.abort();

    await waitForDatabase({ authenticate }, controller.signal);

    expect(authenticate).not.toHaveBeenCalled();
  });

  it('stops waiting between attempts when aborted', async () => {
    const authenticate = jest.fn<Promise<void>, []>()
      .mockRejectedValue(new Error('Database unavailable'));

    const controller = new AbortController();
    const waiting = waitForDatabase(
      { authenticate },
      controller.signal,
    );

    await setImmediate();
    controller.abort();

    await expect(waiting).resolves.toBeUndefined();
    expect(authenticate).toHaveBeenCalledTimes(1);
  });
});