"use client";

import { MapScreen } from "@/components/map/MapScreen";
import { MapProvider } from "@/context/map-context";

export default function HomePage() {
  return (
    <MapProvider>
      <MapScreen />
    </MapProvider>
  );
}
