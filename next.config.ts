import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/image.png": ["./public/fonts/**/*"],
  },
};

export default nextConfig;
