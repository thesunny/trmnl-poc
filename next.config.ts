import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/image.png": ["./public/fonts/**/*", "./public/27-weather-icons.png"],
  },
};

export default nextConfig;
