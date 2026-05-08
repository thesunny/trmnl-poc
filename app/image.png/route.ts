import { createCanvas } from "@napi-rs/canvas";
import { deflateSync } from "node:zlib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIDTH = 800;
const HEIGHT = 480;

// The four design tones, chosen so each maps cleanly into one 2-bit bucket
// (0..63 → 0, 64..127 → 1, 128..191 → 2, 192..255 → 3).
const BLACK = "#000000";
const DARK = "#555555";
const LIGHT = "#aaaaaa";
const WHITE = "#ffffff";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function renderScene(): Uint8Array {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const rand = mulberry32(0xc0ffee);
  ctx.fillStyle = BLACK;
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(rand() * WIDTH);
    const y = Math.floor(rand() * HEIGHT);
    ctx.fillRect(x, y, 2, 2);
  }

  const cx = 360;
  const cy = 240;
  const orbitRx = 240;
  const orbitRy = 210;

  ctx.strokeStyle = LIGHT;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, orbitRx, orbitRy, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const planetR = 130;
  ctx.fillStyle = LIGHT;
  ctx.beginPath();
  ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = DARK;
  ctx.beginPath();
  ctx.arc(cx + 55, cy + 10, planetR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(cx - 55, cy - 40, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const moonAngle = -0.7;
  const moonX = cx + orbitRx * Math.cos(moonAngle);
  const moonY = cy + orbitRy * Math.sin(moonAngle);
  const moonR = 32;

  ctx.fillStyle = LIGHT;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = DARK;
  ctx.beginPath();
  ctx.arc(moonX + 14, moonY + 4, moonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = BLACK;
  ctx.font = "bold 34px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Planet and Moon", WIDTH / 2, HEIGHT - 32);

  const { data } = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const out = new Uint8Array(WIDTH * HEIGHT);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const v = Math.floor(lum / 64);
    out[p] = v > 3 ? 3 : v;
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

function encode2BitGrayPNG(
  width: number,
  height: number,
  pixels: Uint8Array,
): Buffer {
  const bytesPerRow = Math.ceil(width / 4);
  const filtered = new Uint8Array((bytesPerRow + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (bytesPerRow + 1);
    filtered[rowStart] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const v = pixels[y * width + x] & 0x3;
      filtered[rowStart + 1 + (x >> 2)] |= v << (6 - 2 * (x & 3));
    }
  }

  const idat = deflateSync(filtered);

  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, width);
  dv.setUint32(4, height);
  ihdr[8] = 2; // bit depth
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
  const pixels = renderScene();
  const png = encode2BitGrayPNG(WIDTH, HEIGHT, pixels);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
