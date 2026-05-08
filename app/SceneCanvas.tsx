"use client";

import { useEffect, useRef } from "react";
import {
  drawScene,
  WIDTH,
  HEIGHT,
  ICON_ATLAS_URL,
  type SceneWeather,
} from "./scene";
import { useConditions } from "./ConditionsContext";

const FONT_FACES = [
  { weight: "400", style: "normal", file: "AtkinsonHyperlegible-Regular.ttf" },
  { weight: "400", style: "italic", file: "AtkinsonHyperlegible-Italic.ttf" },
  { weight: "700", style: "normal", file: "AtkinsonHyperlegible-Bold.ttf" },
  {
    weight: "700",
    style: "italic",
    file: "AtkinsonHyperlegible-BoldItalic.ttf",
  },
];

export function SceneCanvas({ weather }: { weather?: SceneWeather }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { override } = useConditions();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const faces = FONT_FACES.map(
        ({ weight, style, file }) =>
          new FontFace("Atkinson Hyperlegible", `url(/fonts/${file})`, {
            weight,
            style,
          }),
      );
      const atlas = new Image();
      atlas.src = ICON_ATLAS_URL;
      const [, ] = await Promise.all([
        Promise.all(faces.map((f) => f.load())),
        atlas.decode(),
      ]);
      if (cancelled) return;
      faces.forEach((f) => document.fonts.add(f));

      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const effective: SceneWeather | undefined =
        weather && override !== null
          ? {
              ...weather,
              code: override,
              forecast: weather.forecast.map((d) => ({
                ...d,
                code: override,
              })),
            }
          : weather;

      drawScene(ctx, effective, atlas);
    })();

    return () => {
      cancelled = true;
    };
  }, [weather, override]);

  return (
    <canvas
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      style={{ display: "block", border: "1px solid #ccc" }}
    />
  );
}
