"use client";

import { useEffect, useRef } from "react";
import {
  drawWeatherIcon,
  ICON_ATLAS_URL,
  ATLAS_ICON_WIDTH,
  ATLAS_ICON_HEIGHT,
} from "./scene";

const PREVIEW_W = ATLAS_ICON_WIDTH / 2;
const PREVIEW_H = ATLAS_ICON_HEIGHT / 2;

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
      ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
      drawWeatherIcon(
        ctx,
        PREVIEW_W / 2,
        PREVIEW_H / 2,
        PREVIEW_W,
        code,
        atlas,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <canvas ref={ref} width={PREVIEW_W} height={PREVIEW_H} />
      <span style={{ fontSize: 12, textAlign: "center", lineHeight: 1.2 }}>
        {label}
      </span>
    </div>
  );
}
