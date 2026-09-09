"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { PhotoClusterMarker } from "@/components/map/PhotoClusterMarker";
import { PhotoPin } from "@/components/map/PhotoPin";
import { useMap } from "@/context/map-context";
import { clusterPhotos } from "@/lib/clustering";
import { buildLandDotGrid, DOT_RADIUS_PX } from "@/lib/land-dots";
import { applyMapStage } from "@/lib/map-stage";
import {
  DOT_MAP_STYLE,
  LAND_GRID_LAYER,
  LAND_GRID_SOURCE,
  MAPBOX_TOKEN,
  PHOTO_DOTS_LAYER,
  PHOTO_DOTS_SOURCE,
} from "@/lib/map-style";
import { photosToPhotoDotsGeoJSON, PHOTO_DOT_COLOR_EXPR } from "@/lib/photo-dots";
import {
  DEFAULT_MAP_ZOOM,
  LAND_DOTS_MAX_ZOOM,
  PHOTO_DOTS_MAX_ZOOM,
  type MapStage,
} from "@/lib/zoom";
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

function ensureDotLayers(map: mapboxgl.Map) {
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
        "circle-color": "#111111",
        "circle-opacity": [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "count"], 0],
          0,
          0.16,
          1,
          0.42,
          3,
          0.72,
          7,
          1,
        ],
      },
    });
  }

  if (!map.getSource(PHOTO_DOTS_SOURCE)) {
    map.addSource(PHOTO_DOTS_SOURCE, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
  }
  if (!map.getLayer(PHOTO_DOTS_LAYER)) {
    map.addLayer({
      id: PHOTO_DOTS_LAYER,
      type: "circle",
      source: PHOTO_DOTS_SOURCE,
      layout: { visibility: "none" },
      paint: {
        "circle-pitch-alignment": "viewport",
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "count"], 1],
          1,
          5.5,
          4,
          8.5,
        ],
        "circle-color": PHOTO_DOT_COLOR_EXPR as unknown as mapboxgl.ExpressionSpecification,
        "circle-opacity": [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "count"], 1],
          1,
          0.82,
          4,
          1,
        ],
        "circle-stroke-width": 1.2,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
}

export function AlbumMap() {
  const {
    filteredPhotos,
    mapZoom,
    setMapZoom,
    mapRef,
    openPhoto,
    flyToClusters,
    flyToDetail,
    flyToPins,
    overlayMode,
  } = useMap();

  const [mapReady, setMapReady] = useState(false);
  const settleTimer = useRef<number | null>(null);
  const interactingRef = useRef(false);
  const stageRef = useRef<MapStage | null>(null);
  const photosRef = useRef(filteredPhotos);
  photosRef.current = filteredPhotos;

  const clusters = useMemo(() => {
    if (overlayMode !== "clusters" && overlayMode !== "pins") return [];
    return clusterPhotos(filteredPhotos, overlayMode === "pins" ? "pins" : "clusters", mapZoom);
  }, [filteredPhotos, mapZoom, overlayMode]);

  const syncPhotoDots = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map?.isStyleLoaded()) return;
    ensureDotLayers(map);
    const source = map.getSource(PHOTO_DOTS_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(photosToPhotoDotsGeoJSON(photosRef.current));
  }, [mapRef]);

  const rebuildLandGrid = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map?.isStyleLoaded()) return;
    if (map.getZoom() >= LAND_DOTS_MAX_ZOOM) return;
    if (!map.areTilesLoaded()) return;

    ensureDotLayers(map);
    const source = map.getSource(LAND_GRID_SOURCE) as mapboxgl.GeoJSONSource | undefined;
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

    ensureDotLayers(map);
    syncPhotoDots();

    const onInteractionStart = () => {
      interactingRef.current = true;
    };

    const onSettled = () => {
      interactingRef.current = false;
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        if (!map.isStyleLoaded()) return;
        const zoom = map.getZoom();
        ensureDotLayers(map);
        stageRef.current = applyMapStage(map, zoom, stageRef.current);
        setMapZoom(zoom);
        if (zoom < LAND_DOTS_MAX_ZOOM) rebuildLandGrid();
      }, 80);
    };

    const onSourceData = (event: mapboxgl.MapSourceDataEvent) => {
      if (interactingRef.current) return;
      if (!event.isSourceLoaded) return;
      if (event.sourceId !== "mapbox-streets" && event.sourceId !== "mapbox-satellite") return;
      if (map.getZoom() >= LAND_DOTS_MAX_ZOOM) return;
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
  }, [mapReady, mapRef, rebuildLandGrid, setMapZoom, syncPhotoDots]);

  useEffect(() => {
    if (interactingRef.current) return;
    syncPhotoDots();
    if (overlayMode === "dots") rebuildLandGrid();
  }, [filteredPhotos, overlayMode, rebuildLandGrid, syncPhotoDots]);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const zoom = map.getZoom();
      if (zoom < LAND_DOTS_MAX_ZOOM) {
        flyToClusters(event.lngLat.lat, event.lngLat.lng);
        return;
      }
      if (zoom < PHOTO_DOTS_MAX_ZOOM) {
        flyToDetail(event.lngLat.lat, event.lngLat.lng);
      }
    },
    [flyToClusters, flyToDetail, mapRef],
  );

  if (!MAPBOX_TOKEN) {
    return <MissingMapboxToken />;
  }

  const canvasBg = overlayMode === "clusters" || overlayMode === "pins" ? "#0b0b0b" : "#ffffff";

  return (
    <div className="absolute inset-0" style={{ background: canvasBg }}>
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
        style={{ width: "100%", height: "100%", background: canvasBg }}
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
