"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { PhotoClusterMarker } from "@/components/map/PhotoClusterMarker";
import { PhotoPin } from "@/components/map/PhotoPin";
import { useMap } from "@/context/map-context";
import { hexByCategoryList } from "@/lib/categories";
import { clusterPhotos } from "@/lib/clustering";
import { buildLandDotGrid, DENSITY_OPACITY_EXPR, DOT_RADIUS_PX } from "@/lib/land-dots";
import { applyMapStage } from "@/lib/map-stage";
import { applyMapTheme, landDotColorExpr } from "@/lib/map-theme";
import { DOT_MAP_STYLE, LAND_GRID_LAYER, LAND_GRID_SOURCE, MAPBOX_TOKEN } from "@/lib/map-style";
import {
  DEFAULT_MAP_ZOOM,
  DOT_MAX_ZOOM,
  isKoreaMinZoom,
  magnetCenterTowardKorea,
  maxBoundsForMinZoom,
  snapStartFromMin,
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

function ensureDotLayer(map: mapboxgl.Map, theme: "light" | "dark" = "light") {
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
        "circle-color": landDotColorExpr(theme),
        "circle-opacity": DENSITY_OPACITY_EXPR,
        "circle-color-transition": { duration: 280, delay: 0 },
        "circle-opacity-transition": { duration: 280, delay: 0 },
      },
    });
  } else {
    map.setPaintProperty(LAND_GRID_LAYER, "circle-color", landDotColorExpr(theme));
    map.setPaintProperty(LAND_GRID_LAYER, "circle-opacity", DENSITY_OPACITY_EXPR);
  }
}

export function AlbumMap() {
  const {
    filteredPhotos,
    selectedCountryId,
    selectedCategories,
    keyCategories,
    mapZoom,
    setMapZoom,
    mapRef,
    openPhoto,
    flyToClusters,
    flyToPins,
    overlayMode,
    settings,
  } = useMap();

  const [mapReady, setMapReady] = useState(false);
  const settleTimer = useRef<number | null>(null);
  const stageRef = useRef<MapStage | null>(null);
  const gridKeyRef = useRef<string>("");
  const photosRef = useRef(filteredPhotos);
  const countryRef = useRef(selectedCountryId);
  const colorizeRef = useRef(selectedCategories.size > 0);
  const hexById = useMemo(() => hexByCategoryList(keyCategories), [keyCategories]);
  const hexRef = useRef(hexById);
  photosRef.current = filteredPhotos;
  countryRef.current = selectedCountryId;
  colorizeRef.current = selectedCategories.size > 0;
  hexRef.current = hexById;

  const cameraRef = useRef({
    minZoom: settings.minZoom,
    snapStart: snapStartFromMin(settings.minZoom),
    home: [settings.homeLng, settings.homeLat] as [number, number],
    theme: settings.mapTheme,
  });
  cameraRef.current = {
    minZoom: settings.minZoom,
    snapStart: snapStartFromMin(settings.minZoom),
    home: [settings.homeLng, settings.homeLat],
    theme: settings.mapTheme,
  };

  const clusters = useMemo(() => {
    if (overlayMode !== "clusters" && overlayMode !== "pins") return [];
    return clusterPhotos(filteredPhotos, overlayMode === "pins" ? "pins" : "clusters", mapZoom);
  }, [filteredPhotos, mapZoom, overlayMode]);

  const rebuildLandGrid = useCallback(
    (force = false) => {
      const map = mapRef.current?.getMap();
      if (!map?.isStyleLoaded()) return;
      if (!map.areTilesLoaded()) return;

      const key = `color-v1:${countryRef.current}:${colorizeRef.current}:${photosRef.current
        .map((photo) => `${photo.id}:${photo.category ?? "_"}`)
        .join(",")}:${Object.keys(hexRef.current).join(",")}`;
      if (!force && gridKeyRef.current === key) return;

      ensureDotLayer(map, cameraRef.current.theme);
      const source = map.getSource(LAND_GRID_SOURCE) as mapboxgl.GeoJSONSource | undefined;
      source?.setData(
        buildLandDotGrid(map, photosRef.current, countryRef.current, colorizeRef.current, hexRef.current),
      );
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

  const applyingCamera = useRef(false);
  const zoomGesture = useRef(false);

  const syncMinZoomPan = useCallback((map: mapboxgl.Map) => {
    if (isKoreaMinZoom(map.getZoom(), cameraRef.current.minZoom)) {
      if (map.dragPan.isEnabled()) map.dragPan.disable();
    } else if (!map.dragPan.isEnabled()) {
      map.dragPan.enable();
    }
  }, []);

  const pullTowardKoreaHome = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || applyingCamera.current) return;
    const { minZoom, snapStart, home } = cameraRef.current;
    const zoom = map.getZoom();
    syncMinZoomPan(map);
    if (zoom >= snapStart) return;

    if (zoom <= minZoom + 0.02) {
      const center = map.getCenter();
      if (
        Math.abs(center.lng - home[0]) < 0.001 &&
        Math.abs(center.lat - home[1]) < 0.001 &&
        Math.abs(zoom - minZoom) < 0.01
      ) {
        return;
      }
      applyingCamera.current = true;
      map.jumpTo({ center: home, zoom: minZoom });
      applyingCamera.current = false;
      return;
    }

    const center = map.getCenter();
    const next = magnetCenterTowardKorea(center.lng, center.lat, zoom, home, minZoom, snapStart);
    if (Math.abs(next[0] - center.lng) < 0.0004 && Math.abs(next[1] - center.lat) < 0.0004) {
      return;
    }
    applyingCamera.current = true;
    map.setCenter(next);
    applyingCamera.current = false;
  }, [mapRef, syncMinZoomPan]);

  const lockIfMinZoom = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || applyingCamera.current) return;
    const { minZoom, home } = cameraRef.current;
    if (!isKoreaMinZoom(map.getZoom(), minZoom)) return;
    const center = map.getCenter();
    if (Math.abs(center.lng - home[0]) < 0.001 && Math.abs(center.lat - home[1]) < 0.001) {
      return;
    }
    applyingCamera.current = true;
    map.jumpTo({ center: home, zoom: minZoom });
    applyingCamera.current = false;
  }, [mapRef]);

  const settleKoreaCamera = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || applyingCamera.current) return;
    const { minZoom, snapStart, home } = cameraRef.current;
    const zoom = map.getZoom();
    syncMinZoomPan(map);
    if (zoom >= snapStart) return;

    const center = map.getCenter();
    const lock = isKoreaMinZoom(zoom, minZoom);
    const dest = lock ? home : magnetCenterTowardKorea(center.lng, center.lat, zoom, home, minZoom, snapStart);
    const destZoom = lock ? minZoom : Math.max(zoom, minZoom);
    if (
      Math.abs(center.lng - dest[0]) < 0.008 &&
      Math.abs(center.lat - dest[1]) < 0.008 &&
      Math.abs(zoom - destZoom) < 0.04
    ) {
      return;
    }

    applyingCamera.current = true;
    map.easeTo({
      center: dest,
      zoom: destZoom,
      duration: lock ? 360 : 280,
      essential: true,
    });
    map.once("idle", () => {
      applyingCamera.current = false;
    });
  }, [mapRef, syncMinZoomPan]);

  const onZoomStart = useCallback(() => {
    zoomGesture.current = true;
  }, []);

  const onZoomEndSnap = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map && isKoreaMinZoom(map.getZoom(), cameraRef.current.minZoom)) {
      settleKoreaCamera();
    }
  }, [mapRef, settleKoreaCamera]);

  const onMoveEndSnap = useCallback(() => {
    if (zoomGesture.current) {
      zoomGesture.current = false;
      return;
    }
    settleKoreaCamera();
  }, [settleKoreaCamera]);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    ensureDotLayer(map, cameraRef.current.theme);
    applyMapTheme(map, cameraRef.current.theme);

    const onSettled = () => {
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        if (!map.isStyleLoaded()) return;
        const zoom = map.getZoom();
        ensureDotLayer(map, cameraRef.current.theme);
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
    map.on("zoomstart", onZoomStart);
    map.on("zoom", pullTowardKoreaHome);
    map.on("move", lockIfMinZoom);
    map.on("zoomend", onZoomEndSnap);
    map.on("moveend", onMoveEndSnap);
    map.setMinZoom(cameraRef.current.minZoom);
    map.setMaxBounds(maxBoundsForMinZoom(cameraRef.current.minZoom));
    syncMinZoomPan(map);
    onSettled();

    return () => {
      map.off("zoomend", onSettled);
      map.off("sourcedata", onSourceData);
      map.off("zoomstart", onZoomStart);
      map.off("zoom", pullTowardKoreaHome);
      map.off("move", lockIfMinZoom);
      map.off("zoomend", onZoomEndSnap);
      map.off("moveend", onMoveEndSnap);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, [
    mapReady,
    mapRef,
    rebuildLandGrid,
    setMapZoom,
    pullTowardKoreaHome,
    lockIfMinZoom,
    onZoomStart,
    onZoomEndSnap,
    onMoveEndSnap,
    syncMinZoomPan,
  ]);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current?.getMap();
    if (!map?.isStyleLoaded()) return;
    const { minZoom, home, theme } = cameraRef.current;
    applyMapTheme(map, theme);
    map.setMinZoom(minZoom);
    map.setMaxBounds(maxBoundsForMinZoom(minZoom));
    const zoom = map.getZoom();
    if (zoom < minZoom - 0.01 || isKoreaMinZoom(zoom, minZoom)) {
      applyingCamera.current = true;
      map.jumpTo({ center: home, zoom: Math.max(zoom, minZoom) });
      applyingCamera.current = false;
    }
    syncMinZoomPan(map);
  }, [
    mapReady,
    mapRef,
    settings.mapTheme,
    settings.minZoom,
    settings.homeLng,
    settings.homeLat,
    syncMinZoomPan,
  ]);

  useEffect(() => {
    gridKeyRef.current = "";
    rebuildLandGrid(true);
  }, [filteredPhotos, selectedCountryId, selectedCategories, keyCategories, rebuildLandGrid]);

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
    <div className="absolute inset-0" style={{ background: settings.mapTheme === "dark" ? "#111111" : "#ffffff" }}>
      <Map
        ref={handleRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={DOT_MAP_STYLE}
        initialViewState={{
          longitude: settings.homeLng,
          latitude: settings.homeLat,
          zoom: Math.max(DEFAULT_MAP_ZOOM, settings.minZoom),
        }}
        minZoom={settings.minZoom}
        maxZoom={17.5}
        maxBounds={maxBoundsForMinZoom(settings.minZoom)}
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
        style={{
          width: "100%",
          height: "100%",
          background: settings.mapTheme === "dark" ? "#111111" : "#ffffff",
        }}
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
