import { SceneCanvas } from "./SceneCanvas";
import { WeatherIconPreview } from "./WeatherIconPreview";
import { WIDTH, HEIGHT } from "./scene";
import {
  LAT,
  LON,
  WEATHER_CODES,
  WEATHER_DESCRIPTIONS,
  buildForecast,
  fetchWeather,
} from "./weather";
import { fetchTrashDates } from "./calendar";

function compass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round((deg % 360) / 45) % 8];
}

export default async function Home() {
  const [weather, trashDates] = await Promise.all([
    fetchWeather(),
    fetchTrashDates(),
  ]);

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
          <SceneCanvas
            weather={
              weather
                ? {
                    temperature: weather.current.temperature_2m,
                    code: weather.current.weather_code,
                    dailyMax: weather.daily.temperature_2m_max[0],
                    dailyMin: weather.daily.temperature_2m_min[0],
                    forecast: buildForecast(weather),
                    todayDate: weather.daily.time[0],
                    trashDates,
                  }
                : undefined
            }
          />
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: 360,
        }}
      >
        <aside
          style={{
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

        <aside
          style={{
            padding: 16,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        >
          <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>All conditions</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {WEATHER_CODES.map((code) => (
              <WeatherIconPreview
                key={code}
                code={code}
                label={WEATHER_DESCRIPTIONS[code] ?? `Code ${code}`}
              />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
