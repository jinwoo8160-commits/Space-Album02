"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { PhotoClusterMarker } from "@/components/map/PhotoClusterMarker";
import { PhotoPin } from "@/components/map/PhotoPin";
import { useMap } from "@/context/map-context";
import { clusterPhotos } from "@/lib/clustering";
import { buildLandDotGrid, DENSITY_OPACITY_EXPR, DOT_COLOR_EXPR, DOT_RADIUS_PX } from "@/lib/land-dots";
import { applyMapStage } from "@/lib/map-stage";
import { DOT_MAP_STYLE, LAND_GRID_LAYER, LAND_GRID_SOURCE, MAPBOX_TOKEN } from "@/lib/map-style";
import { DEFAULT_MAP_ZOOM, DOT_MAX_ZOOM, type MapStage } from "@/lib/zoom";
import type { MapLayerMouseEvent } from "mapbox-gl";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";

function MissingMapboxToken() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white px-8 text-center text-sm leading-relaxed text-neutral-600">
      Mapbox 토큰이 없습니다. `.env.local` 에 `NEXT_PUBLIC_MAPBOX_TOKEN` 을 넣고
      개발 서버를 다시 시작해 주세요.
    </div>
  );
}

function ensureDotLayer(map: mapboxgl.Map) {
  if (!map.getSource(LAND_GRID_SOURCE)) {
    map.addSource(LAND_GRID_SOURCE, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
  }
  if (!map.getLayer(LAND_GRID_LAYER)) {
    map.addLayer({
      id: LAND_GRID_LAYER,
      type: "circle",
      source: LAND_GRID_SOURCE,
      layout: { visibility: "visible" },
      paint: {
        "circle-radius": DOT_RADIUS_PX,
        "circle-pitch-alignment": "viewport",
        "circle-color": DOT_COLOR_EXPR,
        "circle-opacity": DENSITY_OPACITY_EXPR,
        "circle-color-transition": { duration: 280, delay: 0 },
        "circle-opacity-transition": { duration: 280, delay: 0 },
      },
    });
  } else {
    map.setPaintProperty(LAND_GRID_LAYER, "circle-color", DOT_COLOR_EXPR);
    map.setPaintProperty(LAND_GRID_LAYER, "circle-opacity", DENSITY_OPACITY_EXPR);
  }
}

export function AlbumMap() {
  const {
    filteredPhotos,
    selectedCountryId,
    selectedCategories,
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
  const stageRef = useRef<MapStage | null>(null);
  const gridKeyRef = useRef<string>("");
  const photosRef = useRef(filteredPhotos);
  const countryRef = useRef(selectedCountryId);
  const colorizeRef = useRef(selectedCategories.size > 0);
  photosRef.current = filteredPhotos;
  countryRef.current = selectedCountryId;
  colorizeRef.current = selectedCategories.size > 0;

  const clusters = useMemo(() => {
    if (overlayMode !== "clusters" && overlayMode !== "pins") return [];
    return clusterPhotos(filteredPhotos, overlayMode === "pins" ? "pins" : "clusters", mapZoom);
  }, [filteredPhotos, mapZoom, overlayMode]);

  const rebuildLandGrid = useCallback(
    (force = false) => {
      const map = mapRef.current?.getMap();
      if (!map?.isStyleLoaded()) return;
      if (!map.areTilesLoaded()) return;

      const key = `color-v1:${countryRef.current}:${colorizeRef.current}:${photosRef.current.map((photo) => photo.id).join(",")}`;
      if (!force && gridKeyRef.current === key) return;

      ensureDotLayer(map);
      const source = map.getSource(LAND_GRID_SOURCE) as mapboxgl.GeoJSONSource | undefined;
      source?.setData(buildLandDotGrid(map, photosRef.current, countryRef.current, colorizeRef.current));
      gridKeyRef.current = key;
    },
    [mapRef],
  );

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

    ensureDotLayer(map);

    const onSettled = () => {
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        if (!map.isStyleLoaded()) return;
        const zoom = map.getZoom();
        ensureDotLayer(map);
        stageRef.current = applyMapStage(map, zoom, stageRef.current);
        setMapZoom(zoom);
        if (zoom < DOT_MAX_ZOOM) rebuildLandGrid(false);
      }, 80);
    };

    const onSourceData = (event: mapboxgl.MapSourceDataEvent) => {
      if (!event.isSourceLoaded || event.sourceId !== "mapbox-streets") return;
      if (map.getZoom() >= DOT_MAX_ZOOM) return;
      if (gridKeyRef.current !== "") return;
      onSettled();
    };

    map.on("zoomend", onSettled);
    map.on("sourcedata", onSourceData);
    onSettled();

    return () => {
      map.off("zoomend", onSettled);
      map.off("sourcedata", onSourceData);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, [mapReady, mapRef, rebuildLandGrid, setMapZoom]);

  useEffect(() => {
    gridKeyRef.current = "";
    rebuildLandGrid(true);
  }, [filteredPhotos, selectedCountryId, selectedCategories, rebuildLandGrid]);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      if (map.getZoom() < DOT_MAX_ZOOM) {
        flyToClusters(event.lngLat.lat, event.lngLat.lng);
      }
    },
    [flyToClusters, mapRef],
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
