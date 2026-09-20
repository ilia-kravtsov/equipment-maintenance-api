import request from 'supertest';

import { app } from '../src/app.js';
import * as forecastClient from '../src/api/forecastClient.js';
import { TimeoutError } from '../src/errors/httpErrors.js';

describe('Weather API', () => {
  let equipmentId: string;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/equipment')
      .send({
        name: 'Weather Test Sensor',
        type: 'sensor',
        serialNumber: 'WEATHER-TEST-001',
        location: {
          lat: 55.7558,
          lon: 37.6173,
        },
        status: 'operational',
        installedAt: '2025-01-15',
      });

    expect(response.status).toBe(201);
    equipmentId = response.body.data.id as string;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return weather forecast for equipment', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          timezone: 'Europe/Moscow',
          daily: {
            time: [
              '2026-09-20',
              '2026-09-21',
              '2026-09-22',
            ],
            temperature_2m_max: [20, 21, 22],
            temperature_2m_min: [10, 11, 12],
            precipitation_sum: [0, 2, 0],
            wind_speed_10m_max: [5, 7, 20],
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const response = await request(app)
      .get(`/api/equipment/${equipmentId}/weather`);

    expect(response.status).toBe(200);
    expect(response.body.data.equipmentId).toBe(equipmentId);
    expect(response.body.data.timezone).toBe('Europe/Moscow');

    expect(response.body.data.days).toHaveLength(3);

    expect(response.body.data.days[0]).toMatchObject({
      date: '2026-09-20',
      temperatureMax: 20,
      temperatureMin: 10,
      precipitation: 0,
      windSpeedMax: 5,
      suitableForOutdoorWork: true,
    });
  });

  it('should return 502 when weather service responds with an error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: true,
          reason: 'Internal server error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const response = await request(app)
      .get(`/api/equipment/${equipmentId}/weather`);

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('WEATHER_SERVICE_ERROR');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });

  it('should return 504 when weather service times out', async () => {
    jest
      .spyOn(forecastClient, 'fetchForecast')
      .mockRejectedValue(new TimeoutError(5000));

    const response = await request(app)
      .get(`/api/equipment/${equipmentId}/weather`);

    expect(response.status).toBe(504);
    expect(response.body.error.code).toBe('WEATHER_TIMEOUT');
    expect(response.body.error.requestId).toEqual(expect.any(String));
  });
});