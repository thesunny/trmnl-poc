"use client";

import { useEffect, useRef } from "react";
import { drawScene, WIDTH, HEIGHT } from "./scene";

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

export function SceneCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

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
      await Promise.all(faces.map((f) => f.load()));
      if (cancelled) return;
      faces.forEach((f) => document.fonts.add(f));

      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawScene(ctx);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      style={{ display: "block", border: "1px solid #ccc" }}
    />
  );
}
