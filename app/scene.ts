import { weatherCodeToIcon, type IconType } from "./weather";

export const WIDTH = 800;
export const HEIGHT = 480;

const BLACK = "#000000";
const WHITE = "#ffffff";

export const ICON_ATLAS_URL = "/weather-icons.png";
const ATLAS_PX = 1254;
const ATLAS_CELLS = 3;
const CELL_PX = ATLAS_PX / ATLAS_CELLS;
const CELL_INSET_FRACTION = 0.04; // crop a few pixels inward to skip divider lines

const ICON_GRID: Record<IconType, { col: number; row: number }> = {
  sun: { col: 0, row: 0 },
  "partly-cloudy": { col: 1, row: 0 },
  cloud: { col: 2, row: 0 },
  rain: { col: 0, row: 1 },
  snow: { col: 1, row: 1 },
  thunderstorm: { col: 2, row: 1 },
  fog: { col: 0, row: 2 },
};

export type SceneWeather = {
  temperature: number;
  code: number;
};

export function drawScene(
  ctx: CanvasRenderingContext2D,
  weather: SceneWeather | undefined,
  atlas: CanvasImageSource,
): void {
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const topCenterY = 120;

  if (weather) {
    drawWeatherIcon(
      ctx,
      130,
      topCenterY,
      200,
      weatherCodeToIcon(weather.code),
      atlas,
    );
    drawTemperature(ctx, 480, topCenterY, weather.temperature);
  } else {
    ctx.fillStyle = BLACK;
    ctx.font = "20px 'Atkinson Hyperlegible'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Weather unavailable", WIDTH / 2, topCenterY);
  }
}

function drawTemperature(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  value: number,
): void {
  ctx.fillStyle = BLACK;
  ctx.font = "bold 130px 'Atkinson Hyperlegible'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(value)}°`, cx, cy);
}

export function drawWeatherIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  type: IconType,
  atlas: CanvasImageSource,
): void {
  const { col, row } = ICON_GRID[type];
  const inset = CELL_PX * CELL_INSET_FRACTION;
  const sx = col * CELL_PX + inset;
  const sy = row * CELL_PX + inset;
  const sSide = CELL_PX - 2 * inset;
  ctx.drawImage(
    atlas,
    sx,
    sy,
    sSide,
    sSide,
    cx - size / 2,
    cy - size / 2,
    size,
    size,
  );
}
