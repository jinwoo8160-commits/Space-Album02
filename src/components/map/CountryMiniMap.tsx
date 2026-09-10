"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import {
  applyPreviewCountryFilter,
  buildPreviewDotGrid,
  PREVIEW_DOT_LAYER,
  PREVIEW_DOT_RADIUS,
  PREVIEW_DOT_SOURCE,
  PREVIEW_MAP_STYLE,
  previewFitBounds,
  type PreviewMapId,
} from "@/lib/preview-dots";
import { MAPBOX_TOKEN } from "@/lib/map-style";
import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { useCallback, useRef } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";

function ensurePreviewDots(map: MapboxMap, id: PreviewMapId): boolean {
  applyPreviewCountryFilter(map, id);
  if (!map.getSource(PREVIEW_DOT_SOURCE)) {
    map.addSource(PREVIEW_DOT_SOURCE, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
  }
  if (!map.getLayer(PREVIEW_DOT_LAYER)) {
    map.addLayer({
      id: PREVIEW_DOT_LAYER,
      type: "circle",
      source: PREVIEW_DOT_SOURCE,
      paint: {
        "circle-radius": PREVIEW_DOT_RADIUS[id],
        "circle-pitch-alignment": "viewport",
        "circle-color": "#111111",
        "circle-opacity": id === "world" ? 0.9 : 0.78,
      },
    });
  }
  const data = buildPreviewDotGrid(map, id);
  if (id !== "kr" && data.features.length === 0) return false;
  const source = map.getSource(PREVIEW_DOT_SOURCE) as GeoJSONSource | undefined;
  source?.setData(data);
  return true;
}

export function CountryMiniMap({
  id,
  className,
}: {
  id: PreviewMapId;
  className?: string;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const built = useRef(false);
  const fit = previewFitBounds(id);

  const paintDots = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map?.isStyleLoaded()) return;
    if (ensurePreviewDots(map, id)) built.current = true;
  }, [id]);

  if (!MAPBOX_TOKEN) {
    return <div className={`bg-white ${className ?? ""}`} />;
  }

  return (
    <div className={`country-mini-map pointer-events-none overflow-hidden bg-white ${className ?? ""}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={PREVIEW_MAP_STYLE}
        initialViewState={{
          bounds: fit.bounds,
          fitBoundsOptions: { padding: fit.padding, maxZoom: fit.maxZoom },
        }}
        interactive={false}
        attributionControl={false}
        dragPan={false}
        scrollZoom={false}
        doubleClickZoom={false}
        dragRotate={false}
        pitchWithRotate={false}
        keyboard={false}
        boxZoom={false}
        touchZoomRotate={false}
        renderWorldCopies={false}
        antialias={false}
        fadeDuration={0}
        style={{ width: "100%", height: "100%" }}
        onLoad={(event) => {
          const map = event.target;
          applyPreviewCountryFilter(map, id);
          map.fitBounds(fit.bounds, { padding: fit.padding, maxZoom: fit.maxZoom, duration: 0 });
          map.once("idle", paintDots);
        }}
        onIdle={() => {
          if (!built.current) paintDots();
        }}
      />
    </div>
  );
}
