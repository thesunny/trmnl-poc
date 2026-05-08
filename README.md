# trmnl-poc

A small Next.js proof-of-concept for generating images suitable for a [TRMNL](https://usetrmnl.com) e-paper display: 800×480, true 2-bit (4-shade) grayscale PNGs.

## What's here

- **`/image.png`** — a Route Handler that renders a "Planet and Moon" scene with `@napi-rs/canvas`, luminance-quantizes the output to 4 grayscale levels, and emits a true 2-bit PNG via a hand-rolled encoder. `Content-Type: image/png`, `Cache-Control: no-store`.
- **`/`** — a comparison page showing the source canvas (rendered live in the browser at full color) above the quantized PNG, so you can eyeball the effect of the e-paper quantization.

## How it works

- The scene-drawing code lives in `app/scene.ts` as a single `drawScene(ctx)` function. It uses standard `CanvasRenderingContext2D` calls so the same code drives both the server-side `@napi-rs/canvas` (for the PNG) and a real `<canvas>` element in the browser (for the live preview).
- The 2-bit PNG encoder is in `app/image.png/route.ts`. It packs four pixels per byte and emits a minimal PNG (signature + IHDR + IDAT + IEND) — no external image library required.
- Text uses [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont) (Regular / Italic / Bold / BoldItalic), bundled in `public/fonts/`. The server registers the four cuts via `GlobalFonts.registerFromPath`; the browser registers them via the JS `FontFace` API (sidesteps a Tailwind v4 / Lightning CSS dedup of multiple `@font-face` blocks for the same family).

## Run locally

```sh
pnpm install
pnpm dev
```

Then open <http://localhost:3000/>.

## Deploying to Vercel

Should work out of the box:

- `pnpm.supportedArchitectures` in `package.json` ensures the lockfile resolves `@napi-rs/canvas` bindings for both macOS dev and Linux x64/arm64 (glibc) Lambdas.
- `serverExternalPackages: ["@napi-rs/canvas"]` in `next.config.ts` keeps Turbopack from bundling the package's dynamic native-binding loader.
- `outputFileTracingIncludes` in `next.config.ts` ships the TTFs in `public/fonts/` into the `/image.png` Lambda.

## Stack

- Next.js 16 (App Router, Turbopack)
- `@napi-rs/canvas` (Skia-based Canvas2D for Node)
- React 19, Tailwind v4
- Convex is wired into the project but unused by this POC.
