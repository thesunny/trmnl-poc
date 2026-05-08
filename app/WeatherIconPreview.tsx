"use client";

import { useEffect, useRef } from "react";
import {
  drawWeatherIcon,
  ICON_ATLAS_URL,
  ATLAS_ICON_WIDTH,
  ATLAS_ICON_HEIGHT,
} from "./scene";

export function WeatherIconPreview({
  code,
  label,
}: {
  code: number;
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
      ctx.clearRect(0, 0, ATLAS_ICON_WIDTH, ATLAS_ICON_HEIGHT);
      drawWeatherIcon(
        ctx,
        ATLAS_ICON_WIDTH / 2,
        ATLAS_ICON_HEIGHT / 2,
        ATLAS_ICON_WIDTH,
        code,
        atlas,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <canvas
        ref={ref}
        width={ATLAS_ICON_WIDTH}
        height={ATLAS_ICON_HEIGHT}
        style={{ flexShrink: 0 }}
      />
      <span style={{ fontSize: 14 }}>{label}</span>
    </div>
  );
}
