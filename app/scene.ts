import {
  weatherCodeToIcon,
  type ForecastDay,
  type IconType,
} from "./weather";

export const WIDTH = 800;
export const HEIGHT = 480;

const BLACK = "#000000";
const DARK_GRAY = "#555555";
const LIGHT_GRAY = "#aaaaaa";
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
  dailyMax: number;
  dailyMin: number;
  forecast: ForecastDay[];
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
      185,
      140,
      240,
      weatherCodeToIcon(weather.code),
      atlas,
    );
    drawTemperature(ctx, 600, 170, weather.temperature);

    ctx.fillStyle = DARK_GRAY;
    ctx.font = "46px 'Atkinson Hyperlegible'";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(weather.dailyMax)}°`, 680, 130);
    ctx.fillText(`${Math.round(weather.dailyMin)}°`, 680, 200);
  } else {
    ctx.fillStyle = BLACK;
    ctx.font = "20px 'Atkinson Hyperlegible'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Weather unavailable", WIDTH / 2, topCenterY);
  }

  ctx.strokeStyle = LIGHT_GRAY;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 300);
  ctx.lineTo(780, 300);
  ctx.stroke();

  if (weather) {
    drawForecastRow(ctx, weather.forecast, atlas);
  }
}

function drawForecastRow(
  ctx: CanvasRenderingContext2D,
  forecast: ForecastDay[],
  atlas: CanvasImageSource,
): void {
  const colWidth = WIDTH / 7;
  const labelY = 325;
  const iconCenterY = 390;
  const iconSize = 70;
  const tempY = 450;

  ctx.fillStyle = BLACK;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  forecast.forEach((day, i) => {
    const cx = (i + 0.5) * colWidth;

    ctx.font = "16px 'Atkinson Hyperlegible'";
    ctx.fillText(day.label, cx, labelY);

    drawWeatherIcon(
      ctx,
      cx,
      iconCenterY,
      iconSize,
      weatherCodeToIcon(day.code),
      atlas,
    );

    ctx.font = "20px 'Atkinson Hyperlegible'";
    ctx.fillText(
      `${Math.round(day.min)}°—${Math.round(day.max)}°`,
      cx,
      tempY,
    );
  });
}

function drawTemperature(
  ctx: CanvasRenderingContext2D,
  rightX: number,
  cy: number,
  value: number,
): void {
  ctx.fillStyle = BLACK;
  ctx.font = "150px 'Atkinson Hyperlegible'";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(value)}°`, rightX, cy);
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
