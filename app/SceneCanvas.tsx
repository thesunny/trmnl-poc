"use client";

import { useEffect, useRef } from "react";
import { drawScene, WIDTH, HEIGHT } from "./scene";

export function SceneCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawScene(ctx);
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
