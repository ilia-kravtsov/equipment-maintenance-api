import { fetchForecast } from '../api/forecastClient.js';
import { config } from '../config/index.js';
import type { EquipmentWeather } from '../models/weather.js';

import type { EquipmentService } from './equipmentService.js';

const FORECAST_DAYS = 3;

export class WeatherService {
  constructor(private readonly equipmentService: EquipmentService) {}

  async getByEquipmentId(equipmentId: string): Promise<EquipmentWeather> {
    const equipment = this.equipmentService.getById(equipmentId);

    const forecast = await fetchForecast(
      equipment.location.lat,
      equipment.location.lon,
      FORECAST_DAYS,
    );

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