export const LAT = 49.33695923663912;
export const LON = -123.09610063047549;

export const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export type WeatherResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
  current_units: {
    temperature_2m: string;
    wind_speed_10m: string;
    relative_humidity_2m: string;
  };
};

export type ForecastDay = {
  label: string;
  code: number;
  min: number;
  max: number;
};

export function buildForecast(weather: WeatherResponse): ForecastDay[] {
  const out: ForecastDay[] = [];
  for (let i = 1; i <= 7; i++) {
    const dateStr = weather.daily.time[i];
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const label =
      i === 1
        ? "Tomorrow"
        : date.toLocaleDateString("en-US", { weekday: "long" });
    out.push({
      label,
      code: weather.daily.weather_code[i],
      min: weather.daily.temperature_2m_min[i],
      max: weather.daily.temperature_2m_max[i],
    });
  }
  return out;
}

export async function fetchWeather(): Promise<WeatherResponse | null> {
  const params = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m",
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    forecast_days: "8",
    timezone: "auto",
  });
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params}`,
      { next: { revalidate: 600 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as WeatherResponse;
  } catch {
    return null;
  }
}

export type IconType =
  | "sun"
  | "partly-cloudy"
  | "cloud"
  | "rain"
  | "snow"
  | "thunderstorm"
  | "fog";

export const ALL_ICON_TYPES: IconType[] = [
  "sun",
  "partly-cloudy",
  "cloud",
  "rain",
  "snow",
  "thunderstorm",
  "fog",
];

export const ICON_LABELS: Record<IconType, string> = {
  sun: "Clear",
  "partly-cloudy": "Partly cloudy",
  cloud: "Cloudy",
  rain: "Rain",
  snow: "Snow",
  thunderstorm: "Thunderstorm",
  fog: "Fog",
};

export function weatherCodeToIcon(code: number): IconType {
  if (code === 0) return "sun";
  if (code === 1 || code === 2) return "partly-cloudy";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95 && code <= 99) return "thunderstorm";
  return "cloud";
}
