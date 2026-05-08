import {
  createCanvas,
  GlobalFonts,
  loadImage,
  Path2D as NapiPath2D,
} from "@napi-rs/canvas";
import { deflateSync } from "node:zlib";
import path from "node:path";
import { drawScene, WIDTH, HEIGHT } from "../scene";
import { buildForecast, fetchWeatherFresh } from "../weather";
import { fetchTrashDates } from "../calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Make Path2D available as a global on the Node side so that shared scene
// code can construct paths from SVG strings (e.g. for Lucide icons) without
// caring whether it's running in the browser or in @napi-rs/canvas. The
// browser already provides Path2D as a DOM global; this brings the Node
// runtime to parity.
if (typeof (globalThis as { Path2D?: unknown }).Path2D === "undefined") {
  (globalThis as { Path2D: typeof NapiPath2D }).Path2D = NapiPath2D;
}

for (const file of [
  "AtkinsonHyperlegible-Regular.ttf",
  "AtkinsonHyperlegible-Italic.ttf",
  "AtkinsonHyperlegible-Bold.ttf",
  "AtkinsonHyperlegible-BoldItalic.ttf",
]) {
  GlobalFonts.registerFromPath(
    path.join(process.cwd(), "public/fonts", file),
    "Atkinson Hyperlegible",
  );
}

let atlasPromise: ReturnType<typeof loadImage> | null = null;
function loadAtlas() {
  if (!atlasPromise) {
    atlasPromise = loadImage(
      path.join(process.cwd(), "public/27-weather-icons.png"),
    );
  }
  return atlasPromise;
}

async function renderPixels(): Promise<Uint8Array> {
  const [weather, atlas, trashDates] = await Promise.all([
    fetchWeatherFresh(),
    loadAtlas(),
    fetchTrashDates(),
  ]);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  drawScene(
    ctx as unknown as CanvasRenderingContext2D,
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
      : undefined,
    atlas as unknown as CanvasImageSource,
  );

  const { data } = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const out = new Uint8Array(WIDTH * HEIGHT);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const v = Math.floor(lum / 16);
    out[p] = v > 15 ? 15 : v;
  }
  return out;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++)
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length + 12);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

function encode4BitGrayPNG(
  width: number,
  height: number,
  pixels: Uint8Array,
): Buffer {
  const bytesPerRow = Math.ceil(width / 2);
  const filtered = new Uint8Array((bytesPerRow + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (bytesPerRow + 1);
    filtered[rowStart] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const v = pixels[y * width + x] & 0xf;
      filtered[rowStart + 1 + (x >> 1)] |= v << ((x & 1) === 0 ? 4 : 0);
    }
  }

  const idat = deflateSync(filtered);

  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, width);
  dv.setUint32(4, height);
  ihdr[8] = 4; // bit depth
  ihdr[9] = 0; // color type: grayscale
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = chunk("IHDR", ihdr);
  const idatChunk = chunk("IDAT", idat);
  const iendChunk = chunk("IEND", new Uint8Array(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

export async function GET() {
  const pixels = await renderPixels();
  const png = encode4BitGrayPNG(WIDTH, HEIGHT, pixels);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
