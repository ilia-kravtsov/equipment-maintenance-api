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

export interface EquipmentWeatherDay extends ForecastDay {
  suitableForOutdoorWork: boolean;
}

export interface EquipmentWeather {
  equipmentId: string;
  location: {
    lat: number;
    lon: number;
  };
  timezone: string;
  days: EquipmentWeatherDay[];
}