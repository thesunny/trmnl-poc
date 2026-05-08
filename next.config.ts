import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/image.png": ["./public/fonts/**/*", "./public/weather-icons.png"],
  },
};

export default nextConfig;
