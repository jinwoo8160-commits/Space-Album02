"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { PhotoClusterMarker } from "@/components/map/PhotoClusterMarker";
import { PhotoPin } from "@/components/map/PhotoPin";
import { useMap } from "@/context/map-context";
import { clusterPhotos } from "@/lib/clustering";
import { buildLandDotGrid, DOT_RADIUS_PX } from "@/lib/land-dots";
import { DOT_MAP_STYLE, MAPBOX_TOKEN } from "@/lib/map-style";
import { CLUSTER_MAX_ZOOM, DEFAULT_MAP_ZOOM, DOT_ZOOM_THRESHOLD } from "@/lib/zoom";
import type { MapLayerMouseEvent } from "mapbox-gl";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";

const SOURCE_ID = "land-grid";
const LAYER_ID = "land-grid-circles";

function MissingMapboxToken() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white px-8 text-center text-sm leading-relaxed text-neutral-600">
      Mapbox 토큰이 없습니다. `.env.local` 에 `NEXT_PUBLIC_MAPBOX_TOKEN` 을 넣고
      개발 서버를 다시 시작해 주세요.
    </div>
  );
}

function ensureLandGridLayer(map: mapboxgl.Map) {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
  }
  if (!map.getLayer(LAYER_ID)) {
    map.addLayer({
      id: LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      layout: { visibility: "visible" },
      paint: {
        "circle-radius": DOT_RADIUS_PX,
        "circle-pitch-alignment": "viewport",
        "circle-color": [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "count"], 0],
          0,
          "#E5E5E5",
          1,
          "#B5B5B5",
          2,
          "#7A7A7A",
          4,
          "#3F3F3F",
          7,
          "#111111",
        ],
        "circle-opacity": 1,
      },
    });
  }
}

function setDotsVisible(map: mapboxgl.Map, visible: boolean) {
  if (!map.getLayer(LAYER_ID)) return;
  const next = visible ? "visible" : "none";
  if (map.getLayoutProperty(LAYER_ID, "visibility") === next) return;
  map.setLayoutProperty(LAYER_ID, "visibility", next);
}

export function AlbumMap() {
  const {
    filteredPhotos,
    mapZoom,
    setMapZoom,
    mapRef,
    openPhoto,
    flyToClusters,
    flyToPins,
    overlayMode,
  } = useMap();

  const [mapReady, setMapReady] = useState(false);
  const settleTimer = useRef<number | null>(null);
  const interactingRef = useRef(false);
  const photosRef = useRef(filteredPhotos);
  photosRef.current = filteredPhotos;

  const clusters = useMemo(() => {
    if (overlayMode === "dots") return [];
    return clusterPhotos(
      filteredPhotos,
      overlayMode === "pins" ? "pins" : "clusters",
      mapZoom,
    );
  }, [filteredPhotos, mapZoom, overlayMode]);

  const rebuildGrid = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map?.isStyleLoaded()) return;
    if (map.getZoom() >= DOT_ZOOM_THRESHOLD) return;
    if (!map.areTilesLoaded()) return;

    ensureLandGridLayer(map);
    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(buildLandDotGrid(map, photosRef.current));
  }, [mapRef]);

  const handleRef = useCallback(
    (node: MapRef | null) => {
      mapRef.current = node;
    },
    [mapRef],
  );

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    ensureLandGridLayer(map);

    const onInteractionStart = () => {
      interactingRef.current = true;
    };

    const onSettled = () => {
      interactingRef.current = false;
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        if (!map.isStyleLoaded()) return;
        const zoom = map.getZoom();
        const showDots = zoom < DOT_ZOOM_THRESHOLD;
        ensureLandGridLayer(map);
        setDotsVisible(map, showDots);
        setMapZoom(zoom);
        if (showDots) rebuildGrid();
      }, 80);
    };

    const onSourceData = (event: mapboxgl.MapSourceDataEvent) => {
      if (interactingRef.current) return;
      if (!event.isSourceLoaded || event.sourceId !== "mapbox-streets") return;
      if (map.getZoom() >= DOT_ZOOM_THRESHOLD) return;
      onSettled();
    };

    map.on("zoomstart", onInteractionStart);
    map.on("dragstart", onInteractionStart);
    map.on("zoomend", onSettled);
    map.on("moveend", onSettled);
    map.on("sourcedata", onSourceData);
    onSettled();

    return () => {
      map.off("zoomstart", onInteractionStart);
      map.off("dragstart", onInteractionStart);
      map.off("zoomend", onSettled);
      map.off("moveend", onSettled);
      map.off("sourcedata", onSourceData);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, [mapReady, mapRef, rebuildGrid, setMapZoom]);

  useEffect(() => {
    if (interactingRef.current) return;
    if (overlayMode !== "dots") return;
    rebuildGrid();
  }, [filteredPhotos, overlayMode, rebuildGrid]);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const zoom = map.getZoom();
      if (zoom < DOT_ZOOM_THRESHOLD) {
        flyToClusters(event.lngLat.lat, event.lngLat.lng);
        return;
      }
      if (zoom < CLUSTER_MAX_ZOOM) {
        flyToPins(event.lngLat.lat, event.lngLat.lng);
      }
    },
    [flyToClusters, flyToPins, mapRef],
  );

  if (!MAPBOX_TOKEN) {
    return <MissingMapboxToken />;
  }

  return (
    <div className="absolute inset-0 bg-white">
      <Map
        ref={handleRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={DOT_MAP_STYLE}
        initialViewState={{
          longitude: 127.8,
          latitude: 36.35,
          zoom: DEFAULT_MAP_ZOOM,
        }}
        minZoom={1.4}
        maxZoom={17.5}
        attributionControl={false}
        logoPosition="bottom-right"
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        fadeDuration={0}
        antialias={false}
        onLoad={() => setMapReady(true)}
        onClick={handleMapClick}
        cursor="grab"
        style={{ width: "100%", height: "100%", background: "#ffffff" }}
      >
        {overlayMode === "clusters"
          ? clusters.map((cluster) => (
              <Marker
                key={cluster.id}
                longitude={cluster.lng}
                latitude={cluster.lat}
                anchor="center"
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                }}
              >
                <PhotoClusterMarker
                  cluster={cluster}
                  onClick={() => flyToPins(cluster.lat, cluster.lng)}
                />
              </Marker>
            ))
          : null}

        {overlayMode === "pins"
          ? filteredPhotos.map((photo) => (
              <Marker
                key={photo.id}
                longitude={photo.lng}
                latitude={photo.lat}
                anchor="bottom"
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                }}
              >
                <PhotoPin photo={photo} onClick={() => openPhoto(photo.id)} />
              </Marker>
            ))
          : null}
      </Map>
    </div>
  );
}
