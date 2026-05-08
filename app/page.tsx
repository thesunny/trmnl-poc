import { SceneCanvas } from "./SceneCanvas";
import { WIDTH, HEIGHT } from "./scene";

const LAT = 49.33695923663912;
const LON = -123.09610063047549;

const WEATHER_DESCRIPTIONS: Record<number, string> = {
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

type WeatherResponse = {
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
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  current_units: {
    temperature_2m: string;
    wind_speed_10m: string;
    relative_humidity_2m: string;
  };
};

async function fetchWeather(): Promise<WeatherResponse | null> {
  const params = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m",
    daily: "temperature_2m_max,temperature_2m_min",
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

function compass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round((deg % 360) / 45) % 8];
}

export default async function Home() {
  const weather = await fetchWeather();

  return (
    <main
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "row",
        gap: 24,
        alignItems: "flex-start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section>
          <h2 style={{ margin: "0 0 8px" }}>Source canvas (full color)</h2>
          <SceneCanvas />
        </section>
        <section>
          <h2 style={{ margin: "0 0 8px" }}>
            Quantized 2-bit grayscale PNG (/image.png)
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image.png"
            width={WIDTH}
            height={HEIGHT}
            alt="Planet and Moon (2-bit grayscale)"
            style={{ display: "block", border: "1px solid #ccc" }}
          />
        </section>
      </div>

      <aside
        style={{
          width: 260,
          padding: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Weather</h2>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
          {LAT.toFixed(4)}, {LON.toFixed(4)}
        </div>
        {weather ? (
          <>
            <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>
              {Math.round(weather.current.temperature_2m)}
              {weather.current_units.temperature_2m}
            </div>
            <div style={{ marginTop: 4, marginBottom: 12 }}>
              {WEATHER_DESCRIPTIONS[weather.current.weather_code] ?? "—"}
            </div>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                columnGap: 12,
                rowGap: 4,
                margin: 0,
              }}
            >
              <dt style={{ color: "#666" }}>Feels like</dt>
              <dd style={{ margin: 0 }}>
                {Math.round(weather.current.apparent_temperature)}
                {weather.current_units.temperature_2m}
              </dd>
              <dt style={{ color: "#666" }}>Humidity</dt>
              <dd style={{ margin: 0 }}>
                {weather.current.relative_humidity_2m}
                {weather.current_units.relative_humidity_2m}
              </dd>
              <dt style={{ color: "#666" }}>Wind</dt>
              <dd style={{ margin: 0 }}>
                {Math.round(weather.current.wind_speed_10m)}{" "}
                {weather.current_units.wind_speed_10m}{" "}
                {compass(weather.current.wind_direction_10m)}
              </dd>
              <dt style={{ color: "#666" }}>Today</dt>
              <dd style={{ margin: 0 }}>
                {Math.round(weather.daily.temperature_2m_min[0])}–
                {Math.round(weather.daily.temperature_2m_max[0])}
                {weather.current_units.temperature_2m}
              </dd>
            </dl>
            <div style={{ fontSize: 11, color: "#999", marginTop: 12 }}>
              Updated{" "}
              {new Date(weather.current.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · Open-Meteo
            </div>
            <details style={{ marginTop: 12 }}>
              <summary
                style={{
                  cursor: "pointer",
                  color: "#666",
                  fontSize: 12,
                }}
              >
                more...
              </summary>
              <pre
                style={{
                  marginTop: 8,
                  padding: 8,
                  background: "#f5f5f5",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, monospace",
                  overflow: "auto",
                  maxHeight: 320,
                }}
              >
                {JSON.stringify(weather, null, 2)}
              </pre>
            </details>
          </>
        ) : (
          <div style={{ color: "#999" }}>Weather unavailable</div>
        )}
      </aside>
    </main>
  );
}
