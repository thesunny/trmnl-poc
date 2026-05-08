import { WEATHER_CODES, type ForecastDay } from "./weather";

export const WIDTH = 800;
export const HEIGHT = 480;

const BLACK = "#000000";
const DARK_GRAY = "#555555";
const LIGHT_GRAY = "#aaaaaa";
const WHITE = "#ffffff";

export const ICON_ATLAS_URL = "/27-weather-icons.png";

// Tunable atlas-extraction parameters. Adjust to taste.
export const ATLAS_START_X = 17;
export const ATLAS_START_Y = 17;
export const ATLAS_ICON_WIDTH = 180;
export const ATLAS_ICON_HEIGHT = 180;
export const ATLAS_X_GAP = 28;
export const ATLAS_Y_GAP = 70;
const ATLAS_COLS = 6;

export type SceneWeather = {
  temperature: number;
  code: number;
  dailyMax: number;
  dailyMin: number;
  forecast: ForecastDay[];
  todayDate: string;
  trashDates: string[];
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
    drawWeatherIcon(ctx, 185, 140, 240, weather.code, atlas);
    drawTemperature(ctx, 600, 150, weather.temperature);

    if (weather.trashDates.includes(weather.todayDate)) {
      drawTrashIcon(ctx, 185, 275, 28);
    }

    ctx.fillStyle = DARK_GRAY;
    ctx.font = "46px 'Atkinson Hyperlegible'";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(weather.dailyMax)}°`, 680, 110);
    ctx.fillText(`${Math.round(weather.dailyMin)}°`, 680, 180);
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
  ctx.moveTo(20, 290);
  ctx.lineTo(780, 290);
  ctx.stroke();

  if (weather) {
    drawForecastRow(ctx, weather.forecast, weather.trashDates, atlas);
  }
}

function drawForecastRow(
  ctx: CanvasRenderingContext2D,
  forecast: ForecastDay[],
  trashDates: string[],
  atlas: CanvasImageSource,
): void {
  const colWidth = WIDTH / 7;
  const labelY = 325;
  const iconCenterY = 390;
  const iconSize = 70;
  const trashCenterY = 432;
  const trashSize = 14;
  const tempY = 450;

  ctx.fillStyle = BLACK;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  forecast.forEach((day, i) => {
    const cx = (i + 0.5) * colWidth;

    ctx.font = "16px 'Atkinson Hyperlegible'";
    ctx.fillText(day.label, cx, labelY);

    drawWeatherIcon(ctx, cx, iconCenterY, iconSize, day.code, atlas);

    if (trashDates.includes(day.date)) {
      drawTrashIcon(ctx, cx, trashCenterY, trashSize);
    }

    ctx.font = "20px 'Atkinson Hyperlegible'";
    ctx.fillText(
      `${Math.round(day.min)}°—${Math.round(day.max)}°`,
      cx,
      tempY,
    );
  });
}

// Lucide icons are 24x24-viewBox SVGs with stroke=2, round caps, round joins.
// Pass the d attributes from each <path>/<line> as an array of SVG path
// strings; this helper applies the standard transform and stroke style.
//
// Requires Path2D to be available as a global. The browser provides it; in
// @napi-rs/canvas it's a named export, so the route handler exposes it on
// globalThis at module load.
export function drawLucideIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  paths: readonly string[],
): void {
  const scale = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(scale, scale);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 1 / scale; // keep on-canvas stroke at ~1px regardless of icon size
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const d of paths) {
    ctx.stroke(new Path2D(d));
  }
  ctx.restore();
}

// https://lucide.dev/icons/trash-2
const LUCIDE_TRASH_2 = [
  "M3 6h18",
  "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
  "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
  "M10 11v6",
  "M14 11v6",
];

function drawTrashIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  drawLucideIcon(ctx, cx, cy, size, LUCIDE_TRASH_2);
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
  code: number,
  atlas: CanvasImageSource,
): void {
  const index = WEATHER_CODES.indexOf(code);
  if (index < 0) return;
  const col = index % ATLAS_COLS;
  const row = Math.floor(index / ATLAS_COLS);
  const sx = ATLAS_START_X + col * (ATLAS_ICON_WIDTH + ATLAS_X_GAP);
  const sy = ATLAS_START_Y + row * (ATLAS_ICON_HEIGHT + ATLAS_Y_GAP);
  ctx.drawImage(
    atlas,
    sx,
    sy,
    ATLAS_ICON_WIDTH,
    ATLAS_ICON_HEIGHT,
    cx - size / 2,
    cy - size / 2,
    size,
    size,
  );
}
