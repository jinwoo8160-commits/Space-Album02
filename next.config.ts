import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // MapLibre 워커의 import.meta.url 을 Turbopack 이 해석하지 못해,
  // 워커가 이미 들어간 번들(dist/maplibre-gl.js)로 별칭을 겁니다.
  serverExternalPackages: ["maplibre-gl"],
  turbopack: {
    resolveAlias: {
      "maplibre-gl": "./node_modules/maplibre-gl/dist/maplibre-gl.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "maplibre-gl": path.resolve("./node_modules/maplibre-gl/dist/maplibre-gl.js"),
    };
    return config;
  },
};

export default nextConfig;