"use client";

import { useEffect, useRef } from "react";
import { drawWeatherIcon, ICON_ATLAS_URL } from "./scene";
import type { IconType } from "./weather";

const SIZE = 60;

export function WeatherIconPreview({
  type,
  label,
}: {
  type: IconType;
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const atlas = new Image();
      atlas.src = ICON_ATLAS_URL;
      await atlas.decode();
      if (cancelled) return;
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, SIZE, SIZE);
      drawWeatherIcon(ctx, SIZE / 2, SIZE / 2, SIZE * 0.9, type, atlas);
    })();
    return () => {
      cancelled = true;
    };
  }, [type]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <canvas
        ref={ref}
        width={SIZE}
        height={SIZE}
        style={{ flexShrink: 0 }}
      />
      <span style={{ fontSize: 14 }}>{label}</span>
    </div>
  );
}
