"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { PhotoClusterMarker } from "@/components/map/PhotoClusterMarker";
import { PhotoPin } from "@/components/map/PhotoPin";
import { useMap } from "@/context/map-context";
import { clusterPhotos } from "@/lib/clustering";
import { buildLandDotGrid, DOT_RADIUS_PX } from "@/lib/land-dots";
import { DOT_MAP_STYLE, MAPBOX_TOKEN } from "@/lib/map-style";
import {
  clusterLayerOpacity,
  CLUSTER_MAX_ZOOM,
  DOT_FADE_END,
  DOT_FADE_START,
  pinLayerOpacity,
} from "@/lib/zoom";
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
        "circle-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          DOT_FADE_START,
          1,
          DOT_FADE_END,
          0,
        ],
        "circle-opacity-transition": { duration: 0 },
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
    flyToPins,
  } = useMap();

  const [mapReady, setMapReady] = useState(false);
  const rebuildTimer = useRef<number | null>(null);
  const photosRef = useRef(filteredPhotos);
  photosRef.current = filteredPhotos;

  const clusters = useMemo(
    () =>
      clusterPhotos(
        filteredPhotos,
        mapZoom >= CLUSTER_MAX_ZOOM ? "pins" : "clusters",
        mapZoom,
      ),
    [filteredPhotos, mapZoom],
  );

  const rebuildGrid = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map?.isStyleLoaded()) return;
    if (map.getZoom() > DOT_FADE_END + 0.45) return;
    if (!map.areTilesLoaded()) return;

    ensureLandGridLayer(map);
    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(buildLandDotGrid(map, photosRef.current));
  }, [mapRef]);

  const scheduleRebuild = useCallback(() => {
    if (rebuildTimer.current) window.clearTimeout(rebuildTimer.current);
    rebuildTimer.current = window.setTimeout(() => {
      rebuildGrid();
    }, 70);
  }, [rebuildGrid]);

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

    const onSourceData = (event: mapboxgl.MapSourceDataEvent) => {
      if (event.isSourceLoaded && event.sourceId === "mapbox-streets") {
        scheduleRebuild();
      }
    };

    ensureLandGridLayer(map);
    map.on("idle", scheduleRebuild);
    map.on("zoom", scheduleRebuild);
    map.on("moveend", scheduleRebuild);
    map.on("sourcedata", onSourceData);
    scheduleRebuild();

    return () => {
      map.off("idle", scheduleRebuild);
      map.off("zoom", scheduleRebuild);
      map.off("moveend", scheduleRebuild);
      map.off("sourcedata", onSourceData);
    };
  }, [mapReady, mapRef, scheduleRebuild]);

  useEffect(() => {
    scheduleRebuild();
  }, [filteredPhotos, scheduleRebuild]);

  useEffect(() => {
    return () => {
      if (rebuildTimer.current) window.clearTimeout(rebuildTimer.current);
    };
  }, []);

  const handleZoom = useCallback(
    (event: { viewState: { zoom: number } }) => {
      setMapZoom(event.viewState.zoom);
    },
    [setMapZoom],
  );

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const zoom = map.getZoom();
      if (zoom < DOT_FADE_END) {
        flyToClusters(event.lngLat.lat, event.lngLat.lng);
        return;
      }
      if (zoom < CLUSTER_MAX_ZOOM) {
        flyToPins(event.lngLat.lat, event.lngLat.lng);
      }
    },
    [flyToClusters, flyToPins, mapRef],
  );

  const clusterOp = clusterLayerOpacity(mapZoom);
  const pinOp = pinLayerOpacity(mapZoom);

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
          zoom: 5.55,
        }}
        minZoom={1.4}
        maxZoom={17.5}
        attributionControl={false}
        logoPosition="bottom-right"
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        fadeDuration={0}
        onLoad={() => setMapReady(true)}
        onMove={handleZoom}
        onClick={handleMapClick}
        cursor="grab"
        style={{ width: "100%", height: "100%", background: "#ffffff" }}
      >
        {clusterOp > 0.02
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
                <div style={{ opacity: clusterOp }}>
                  <PhotoClusterMarker
                    cluster={cluster}
                    onClick={() => flyToPins(cluster.lat, cluster.lng)}
                  />
                </div>
              </Marker>
            ))
          : null}

        {pinOp > 0.02
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
                <div style={{ opacity: pinOp }}>
                  <PhotoPin photo={photo} onClick={() => openPhoto(photo.id)} />
                </div>
              </Marker>
            ))
          : null}
      </Map>
    </div>
  );
}
