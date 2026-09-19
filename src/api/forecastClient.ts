import { config } from '../config/index.js';
import { InvalidJsonError } from '../errors/httpErrors.js';
import type { ForecastResult } from '../models/weather.js';

import { fetchJson } from './httpClient.js';

interface ForecastApiResponse {
  timezone?: unknown;
  daily?: {
    time?: unknown;
    temperature_2m_max?: unknown;
    temperature_2m_min?: unknown;
    precipitation_sum?: unknown;
    wind_speed_10m_max?: unknown;
  };
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  days: number,
): Promise<ForecastResult> {
  const url = new URL(config.weatherApiUrl);

  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily:
      'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
    forecast_days: String(days),
    timezone: 'auto',
    wind_speed_unit: 'ms',
  }).toString();

  const data = await fetchJson<ForecastApiResponse>(url);

  if (
    typeof data.timezone !== 'string' ||
    data.daily === undefined ||
    !Array.isArray(data.daily.time) ||
    !Array.isArray(data.daily.temperature_2m_max) ||
    !Array.isArray(data.daily.temperature_2m_min) ||
    !Array.isArray(data.daily.precipitation_sum) ||
    !Array.isArray(data.daily.wind_speed_10m_max)
  ) {
    throw new InvalidJsonError();
  }

  const {
    time,
    temperature_2m_max: temperatureMax,
    temperature_2m_min: temperatureMin,
    precipitation_sum: precipitation,
    wind_speed_10m_max: windSpeedMax,
  } = data.daily;

  const forecastDays = time.map((date, index) => {
    const max = temperatureMax[index];
    const min = temperatureMin[index];
    const precipitationValue = precipitation[index];
    const windSpeed = windSpeedMax[index];

    if (
      typeof date !== 'string' ||
      typeof max !== 'number' ||
      typeof min !== 'number' ||
      typeof precipitationValue !== 'number' ||
      typeof windSpeed !== 'number'
    ) {
      throw new InvalidJsonError();
    }

    return {
      date,
      temperatureMax: max,
      temperatureMin: min,
      precipitation: precipitationValue,
      windSpeedMax: windSpeed,
    };
  });

  return {
    timezone: data.timezone,
    days: forecastDays,
  };
}
