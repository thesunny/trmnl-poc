export const WIDTH = 800;
export const HEIGHT = 480;

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

export function drawScene(ctx: CanvasRenderingContext2D): void {
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
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.font = "bold 34px 'Atkinson Hyperlegible'";
  ctx.fillText("Planet and Moon", WIDTH / 2, HEIGHT - 60);

  ctx.font = "20px 'Atkinson Hyperlegible'";
  ctx.fillText("A celestial scene", WIDTH / 2, HEIGHT - 28);
}
