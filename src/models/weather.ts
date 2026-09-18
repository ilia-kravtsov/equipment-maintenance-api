export interface ForecastDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitation: number;
  windSpeedMax: number;
}

export interface ForecastResult {
  timezone: string;
  days: ForecastDay[];
}