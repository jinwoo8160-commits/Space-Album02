"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import {
  ALBUM_MINI_DOT_RADIUS,
  ALBUM_MINI_GRID_CELLS,
  ALBUM_MINI_MAP_PX,
} from "@/lib/album-land";
import {
  ALBUM_OVERVIEW_ZOOM,
  ALBUM_PIN_ZOOM,
  ALBUM_SOUTH_CENTER,
} from "@/lib/album-period";
import { buildLandDotGrid } from "@/lib/land-dots";
import { applyMapTheme, landDotColorExpr } from "@/lib/map-theme";
import {
  DETAIL_LAYER_IDS,
  DOT_MAP_STYLE,
  LAND_GRID_LAYER,
  LAND_GRID_SOURCE,
  MAPBOX_TOKEN,
} from "@/lib/map-style";
import type { Photo } from "@/types/album";
import type { ExpressionSpecification, GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { useCallback, useEffect, useRef } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";

const EMPTY_GRID = { type: "FeatureCollection" as const, features: [] };

const INITIAL_VIEW = {
  longitude: ALBUM_SOUTH_CENTER[0],
  latitude: ALBUM_SOUTH_CENTER[1],
  zoom: ALBUM_OVERVIEW_ZOOM,
};

const OVERVIEW_CAMERA = {
  center: ALBUM_SOUTH_CENTER,
  zoom: ALBUM_OVERVIEW_ZOOM,
  bearing: 0,
  pitch: 0,
} as const;

const MINI_DENSITY_OPACITY: ExpressionSpecification = [
  "match",
  ["get", "densityLevel"],
  1,
  0.88,
  2,
  0.68,
  3,
  0.48,
  4,
  0.3,
  0.16,
];

function mapStyleReady(map: MapboxMap) {
  try {
    return Boolean(map.style && map.isStyleLoaded());
  } catch {
    return false;
  }
}

function setLayerVisible(map: MapboxMap, layerId: string, visible: boolean) {
  if (!mapStyleReady(map)) return;
  try {
    if (!map.getLayer(layerId)) return;
    const next = visible ? "visible" : "none";
    if (map.getLayoutProperty(layerId, "visibility") === next) return;
    map.setLayoutProperty(layerId, "visibility", next);
  } catch {
    /* style graph can be empty mid-update */
  }
}

function applyPreviewStage(map: MapboxMap, mode: "dots" | "detail") {
  setLayerVisible(map, LAND_GRID_LAYER, mode === "dots");
  for (const layerId of DETAIL_LAYER_IDS) {
    setLayerVisible(map, layerId, mode === "detail");
  }
}

function ensureMiniDotLayer(map: MapboxMap) {
  if (!mapStyleReady(map)) return;
  try {
    if (!map.getSource(LAND_GRID_SOURCE)) {
      map.addSource(LAND_GRID_SOURCE, { type: "geojson", data: EMPTY_GRID });
    }
    if (!map.getLayer(LAND_GRID_LAYER)) {
      map.addLayer({
        id: LAND_GRID_LAYER,
        type: "circle",
        source: LAND_GRID_SOURCE,
        layout: { visibility: "visible" },
        paint: {
          "circle-radius": ALBUM_MINI_DOT_RADIUS,
          "circle-pitch-alignment": "viewport",
          "circle-color": landDotColorExpr("light"),
          "circle-opacity": MINI_DENSITY_OPACITY,
          "circle-color-transition": { duration: 220, delay: 0 },
          "circle-opacity-transition": { duration: 220, delay: 0 },
        },
      });
    } else {
      map.setPaintProperty(LAND_GRID_LAYER, "circle-radius", ALBUM_MINI_DOT_RADIUS);
      map.setPaintProperty(LAND_GRID_LAYER, "circle-color", landDotColorExpr("light"));
      map.setPaintProperty(LAND_GRID_LAYER, "circle-opacity", MINI_DENSITY_OPACITY);
    }
  } catch {
    /* ignore transient style access */
  }
}

function jumpOverview(map: MapboxMap) {
  try {
    map.stop();
    map.jumpTo({ ...OVERVIEW_CAMERA });
  } catch {
    /* ignore */
  }
}

function flyOverview(map: MapboxMap) {
  try {
    map.stop();
    map.flyTo({
      ...OVERVIEW_CAMERA,
      duration: 780,
      essential: true,
    });
  } catch {
    jumpOverview(map);
  }
}

/**
 * 앨범 기간 프리뷰 미니맵.
 * 팬/줌은 막고, 키컬러 핀만 카메라를 움직입니다.
 * 핀을 해제하면 고정 남한 뷰포트로 돌아갑니다.
 */
export function AlbumMiniMap({
  photos,
  pinnedPhoto,
  pinColor,
}: {
  photos: Photo[];
  pinnedPhoto: Photo | null;
  pinColor?: string | null;
  hexById?: Record<string, string>;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const ready = useRef(false);
  const photosRef = useRef(photos);
  const pinnedRef = useRef(pinnedPhoto);
  const gridKeyRef = useRef("");
  const wasPinned = useRef(false);
  const rebuildTimer = useRef<number | null>(null);
  photosRef.current = photos;
  pinnedRef.current = pinnedPhoto;

  const isPinned = Boolean(pinnedPhoto && pinnedPhoto.hasGps !== false);

  const syncStage = useCallback((map: MapboxMap) => {
    const pinned = Boolean(pinnedRef.current && pinnedRef.current.hasGps !== false);
    applyPreviewStage(map, pinned || photosRef.current.length === 0 ? "detail" : "dots");
  }, []);

  const rebuildGrid = useCallback(
    (force = false) => {
      const map = mapRef.current?.getMap();
      if (!map || !ready.current) return;
      if (!mapStyleReady(map)) return;
      if (!map.areTilesLoaded()) return;

      try {
        ensureMiniDotLayer(map);
        const source = map.getSource(LAND_GRID_SOURCE) as GeoJSONSource | undefined;
        if (!source) return;

        const current = photosRef.current;
        if (current.length === 0) {
          source.setData(EMPTY_GRID);
          gridKeyRef.current = "empty";
          syncStage(map);
          return;
        }

        const key = current.map((photo) => `${photo.id}:${photo.category ?? "_"}`).join(",");
        if (!force && gridKeyRef.current === key) {
          syncStage(map);
          return;
        }

        source.setData(
          buildLandDotGrid(map, current, "kr", false, {}, { gridCells: ALBUM_MINI_GRID_CELLS }),
        );
        gridKeyRef.current = key;
        syncStage(map);
      } catch {
        /* queryRenderedFeatures / getLayer can throw while the style graph is swapping */
      }
    },
    [syncStage],
  );

  useEffect(() => {
    if (!ready.current) return;
    if (rebuildTimer.current) window.clearTimeout(rebuildTimer.current);
    rebuildTimer.current = window.setTimeout(() => rebuildGrid(false), 80);
    return () => {
      if (rebuildTimer.current) window.clearTimeout(rebuildTimer.current);
    };
  }, [photos, rebuildGrid]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !ready.current) return;
    if (isPinned && pinnedPhoto) {
      wasPinned.current = true;
      applyPreviewStage(map, "detail");
      try {
        map.stop();
        map.flyTo({
          center: [pinnedPhoto.lng, pinnedPhoto.lat],
          zoom: ALBUM_PIN_ZOOM,
          bearing: 0,
          pitch: 0,
          duration: 780,
          essential: true,
        });
      } catch {
        map.jumpTo({
          center: [pinnedPhoto.lng, pinnedPhoto.lat],
          zoom: ALBUM_PIN_ZOOM,
          bearing: 0,
          pitch: 0,
        });
      }
      const onEnd = () => {
        applyPreviewStage(map, "detail");
      };
      map.once("moveend", onEnd);
      return () => {
        map.off("moveend", onEnd);
      };
    }
    if (wasPinned.current) {
      wasPinned.current = false;
      applyPreviewStage(map, photosRef.current.length === 0 ? "detail" : "dots");
      flyOverview(map);
    }
  }, [isPinned, pinnedPhoto]);

  if (!MAPBOX_TOKEN) {
    return <div className="h-full w-full bg-white" />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={DOT_MAP_STYLE}
          initialViewState={INITIAL_VIEW}
          minZoom={3}
          maxZoom={17.5}
          interactive={false}
          attributionControl={false}
          dragPan={false}
          scrollZoom={false}
          doubleClickZoom={false}
          dragRotate={false}
          pitchWithRotate={false}
          touchPitch={false}
          keyboard={false}
          boxZoom={false}
          touchZoomRotate={false}
          renderWorldCopies={false}
          antialias={false}
          fadeDuration={0}
          style={{ width: "100%", height: "100%", minHeight: ALBUM_MINI_MAP_PX }}
          onLoad={(event) => {
            const map = event.target;
            map.dragPan.disable();
            map.scrollZoom.disable();
            map.boxZoom.disable();
            map.dragRotate.disable();
            map.keyboard.disable();
            map.doubleClickZoom.disable();
            map.touchZoomRotate.disable();
            applyMapTheme(map, "light");
            ensureMiniDotLayer(map);
            jumpOverview(map);
            ready.current = true;
            rebuildGrid(true);
            const pinned = pinnedRef.current;
            if (pinned && pinned.hasGps !== false) {
              applyPreviewStage(map, "detail");
              map.jumpTo({
                center: [pinned.lng, pinned.lat],
                zoom: ALBUM_PIN_ZOOM,
                bearing: 0,
                pitch: 0,
              });
            }

            const onSourceData = (sourceEvent: { isSourceLoaded?: boolean; sourceId?: string }) => {
              if (!sourceEvent.isSourceLoaded || sourceEvent.sourceId !== "mapbox-streets") return;
              if (gridKeyRef.current !== "") return;
              rebuildGrid(true);
            };
            map.on("sourcedata", onSourceData);
          }}
        >
          {isPinned && pinnedPhoto ? (
            <Marker longitude={pinnedPhoto.lng} latitude={pinnedPhoto.lat} anchor="center">
              <span
                className="block size-3.5 rounded-full ring-2 ring-white"
                style={{ backgroundColor: pinColor ?? "#111111" }}
              />
            </Marker>
          ) : null}
        </Map>
      </div>
    </div>
  );
}
