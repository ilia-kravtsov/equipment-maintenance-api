import { fetchForecast } from '../api/forecastClient.js';
import { config } from '../config/index.js';
import type { EquipmentWeather, ForecastResult  } from '../models/weather.js';
import type { EquipmentService } from './equipmentService.js';
import {
  ClientHttpError,
  InvalidJsonError,
  NetworkError,
  ServerHttpError,
  TimeoutError,
} from '../errors/httpErrors.js';
import {
  WeatherServiceError,
  WeatherTimeoutError,
} from '../errors/weatherServiceError.js';

const FORECAST_DAYS = 3;

export class WeatherService {
  constructor(private readonly equipmentService: EquipmentService) {}

  async getByEquipmentId(equipmentId: string): Promise<EquipmentWeather> {
    const equipment = this.equipmentService.getById(equipmentId);

    let forecast: ForecastResult;

    try {
      forecast = await fetchForecast(
        equipment.location.lat,
        equipment.location.lon,
        FORECAST_DAYS,
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new WeatherTimeoutError();
      }

      if (
        error instanceof ClientHttpError ||
        error instanceof ServerHttpError ||
        error instanceof NetworkError ||
        error instanceof InvalidJsonError
      ) {
        throw new WeatherServiceError();
      }

      throw error;
    }

    const days = forecast.days.map((day) => ({
      ...day,
      suitableForOutdoorWork:
        day.precipitation === 0 &&
        day.windSpeedMax < config.weatherMaxWindSpeed,
    }));

    return {
      equipmentId: equipment.id,
      location: equipment.location,
      timezone: forecast.timezone,
      days,
    };
  }
}