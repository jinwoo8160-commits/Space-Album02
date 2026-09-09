import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mapbox-gl"],
  turbopack: {
    resolveAlias: {
      "mapbox-gl": "./node_modules/mapbox-gl/dist/mapbox-gl.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "mapbox-gl": path.resolve("./node_modules/mapbox-gl/dist/mapbox-gl.js"),
    };
    return config;
  },
};

export default nextConfig;