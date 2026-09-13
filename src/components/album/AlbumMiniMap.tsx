"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { ALBUM_LAND_RADIUS, KOREA_ALBUM_LAND_DOTS } from "@/lib/album-land";
import { ALBUM_OVERVIEW_ZOOM, ALBUM_SOUTH_CENTER } from "@/lib/album-period";
import { CATEGORY_HEX, hexForCategory } from "@/lib/categories";
import { MAPBOX_STREETS_SOURCE, MAPBOX_TOKEN, WATER_QUERY_LAYER } from "@/lib/map-style";
import { PREVIEW_MAP_STYLE } from "@/lib/preview-dots";
import { PIN_ZOOM } from "@/lib/zoom";
import type { Photo } from "@/types/album";
import type { FeatureCollection, Point } from "geojson";
import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";

const LAND_SOURCE = "album-land-dots-v4";
const LAND_LAYER = "album-land-circles-v4";
const LAND_DOT_COLOR = "#6e6e6e";
const PHOTO_SOURCE = "album-photo-dots";
const PHOTO_LAYER = "album-photo-circles";
const PIN_SOURCE = "album-pin-dot";
const PIN_LAYER = "album-pin-circle";
const SAT_SOURCE = "album-satellite-v2";
const SAT_LAYER = "album-satellite-raster-v2";
const SAT_ROAD_LAYER = "album-satellite-roads";
const SAT_LABEL_LAYER = "album-satellite-labels";

function photoCollection(
  photos: Photo[],
  hexById: Record<string, string>,
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: photos
      .filter((photo) => photo.hasGps !== false)
      .map((photo) => ({
        type: "Feature",
        properties: {
          id: photo.id,
          color: hexForCategory(photo.category, hexById),
        },
        geometry: { type: "Point", coordinates: [photo.lng, photo.lat] },
      })),
  };
}

function pinCollection(photo: Photo | null): FeatureCollection<Point> {
  if (!photo || photo.hasGps === false) {
    return { type: "FeatureCollection", features: [] };
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [photo.lng, photo.lat] },
      },
    ],
  };
}

function styleReady(map: MapboxMap) {
  try {
    return Boolean(map.isStyleLoaded() && map.getStyle());
  } catch {
    return false;
  }
}

function setVisible(map: MapboxMap, layerId: string, visible: boolean) {
  if (!styleReady(map) || !map.getLayer(layerId)) return;
  const next = visible ? "visible" : "none";
  if (map.getLayoutProperty(layerId, "visibility") === next) return;
  map.setLayoutProperty(layerId, "visibility", next);
}

/** 핀이 켜지면 도트·흰 수역을 숨기고 위성 전경을 켭니다. setStyle 은 쓰지 않습니다. */
function applyAlbumPinView(map: MapboxMap, pinned: boolean) {
  setVisible(map, LAND_LAYER, !pinned);
  setVisible(map, PHOTO_LAYER, !pinned);
  setVisible(map, WATER_QUERY_LAYER, !pinned);
  setVisible(map, SAT_LAYER, pinned);
  setVisible(map, SAT_ROAD_LAYER, pinned);
  setVisible(map, SAT_LABEL_LAYER, pinned);
  if (map.getLayer(SAT_LAYER)) {
    map.setPaintProperty(SAT_LAYER, "raster-opacity", pinned ? 1 : 0);
  }
  if (!pinned || !map.getLayer(SAT_LAYER) || !map.getLayer(PIN_LAYER)) return;
  try {
    map.moveLayer(SAT_LAYER, PIN_LAYER);
    if (map.getLayer(SAT_ROAD_LAYER)) map.moveLayer(SAT_ROAD_LAYER, PIN_LAYER);
    if (map.getLayer(SAT_LABEL_LAYER)) map.moveLayer(SAT_LABEL_LAYER, PIN_LAYER);
  } catch {
    /* 레이어 순서는 최선 노력입니다. */
  }
}

function jumpToSouthOverview(map: MapboxMap) {
  map.jumpTo({
    center: ALBUM_SOUTH_CENTER,
    zoom: ALBUM_OVERVIEW_ZOOM,
    bearing: 0,
    pitch: 0,
  });
}

function flyToPhoto(map: MapboxMap, photo: Photo) {
  map.stop();
  map.flyTo({
    center: [photo.lng, photo.lat],
    zoom: PIN_ZOOM,
    duration: 920,
    essential: true,
    bearing: 0,
    pitch: 0,
  });
}

function ensureLayers(map: MapboxMap) {
  if (!styleReady(map)) return;
  const empty: FeatureCollection<Point> = { type: "FeatureCollection", features: [] };
  if (!map.getSource(SAT_SOURCE)) {
    map.addSource(SAT_SOURCE, {
      type: "raster",
      tiles: [
        `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
      ],
      tileSize: 256,
      maxzoom: 22,
      attribution: "© Mapbox © Maxar",
    });
  }
  if (!map.getLayer(SAT_LAYER)) {
    map.addLayer({
      id: SAT_LAYER,
      type: "raster",
      source: SAT_SOURCE,
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 1,
        "raster-fade-duration": 280,
      },
    });
  }
  if (!map.getLayer(SAT_ROAD_LAYER)) {
    map.addLayer({
      id: SAT_ROAD_LAYER,
      type: "line",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "road",
      minzoom: 9,
      layout: {
        visibility: "none",
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#ffffff",
        "line-opacity": 0.42,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.4, 12.6, 1.6, 15, 3.2],
      },
    });
  }
  if (!map.getLayer(SAT_LABEL_LAYER)) {
    map.addLayer({
      id: SAT_LABEL_LAYER,
      type: "symbol",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "place_label",
      minzoom: 10,
      layout: {
        visibility: "none",
        "text-field": ["coalesce", ["get", "name_ko"], ["get", "name"]],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 10, 11, 14, 15],
        "text-padding": 8,
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "#111111",
        "text-halo-width": 1.1,
      },
    });
  }
  if (!map.getSource(LAND_SOURCE)) {
    map.addSource(LAND_SOURCE, { type: "geojson", data: KOREA_ALBUM_LAND_DOTS });
  } else {
    (map.getSource(LAND_SOURCE) as GeoJSONSource).setData(KOREA_ALBUM_LAND_DOTS);
  }
  if (!map.getLayer(LAND_LAYER)) {
    map.addLayer({
      id: LAND_LAYER,
      type: "circle",
      source: LAND_SOURCE,
      paint: {
        "circle-radius": ALBUM_LAND_RADIUS,
        "circle-pitch-alignment": "viewport",
        "circle-color": LAND_DOT_COLOR,
        "circle-opacity": 1,
      },
    });
  } else {
    map.setPaintProperty(LAND_LAYER, "circle-radius", ALBUM_LAND_RADIUS);
    map.setPaintProperty(LAND_LAYER, "circle-color", LAND_DOT_COLOR);
    map.setPaintProperty(LAND_LAYER, "circle-opacity", 1);
  }
  if (!map.getSource(PHOTO_SOURCE)) {
    map.addSource(PHOTO_SOURCE, { type: "geojson", data: empty });
  }
  if (!map.getLayer(PHOTO_LAYER)) {
    map.addLayer({
      id: PHOTO_LAYER,
      type: "circle",
      source: PHOTO_SOURCE,
      paint: {
        "circle-radius": ALBUM_LAND_RADIUS,
        "circle-pitch-alignment": "viewport",
        "circle-color": ["coalesce", ["get", "color"], "#111111"],
        "circle-opacity": 0.92,
      },
    });
  } else {
    map.setPaintProperty(PHOTO_LAYER, "circle-radius", ALBUM_LAND_RADIUS);
  }
  if (!map.getSource(PIN_SOURCE)) {
    map.addSource(PIN_SOURCE, { type: "geojson", data: empty });
  }
  if (!map.getLayer(PIN_LAYER)) {
    map.addLayer({
      id: PIN_LAYER,
      type: "circle",
      source: PIN_SOURCE,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          ALBUM_OVERVIEW_ZOOM,
          2.6,
          12.6,
          8,
        ],
        "circle-pitch-alignment": "viewport",
        "circle-color": "#111111",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
}

/**
 * 앨범 중앙 남한 미리보기. 핀을 찍으면 위성 전경으로 날아가고, 해제하면 도트 지도로 돌아갑니다.
 */
export function AlbumMiniMap({
  photos,
  pinnedPhoto,
  pinColor,
  hexById = CATEGORY_HEX,
}: {
  photos: Photo[];
  pinnedPhoto: Photo | null;
  pinColor?: string | null;
  hexById?: Record<string, string>;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const photosRef = useRef(photos);
  const pinnedRef = useRef(pinnedPhoto);
  const hexRef = useRef(hexById);
  const ready = useRef(false);
  const lockOverview = useRef(false);
  photosRef.current = photos;
  pinnedRef.current = pinnedPhoto;
  hexRef.current = hexById;

  const [view, setView] = useState({
    longitude: ALBUM_SOUTH_CENTER[0],
    latitude: ALBUM_SOUTH_CENTER[1],
    zoom: ALBUM_OVERVIEW_ZOOM,
  });
  const [mapEpoch, setMapEpoch] = useState(0);
  const wasPinned = useRef(false);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !ready.current) return;
    try {
      if (!map.getSource(PHOTO_SOURCE)) return;
    } catch {
      return;
    }
    (map.getSource(PHOTO_SOURCE) as GeoJSONSource).setData(photoCollection(photos, hexById));
  }, [photos, hexById]);

  useEffect(() => {
    const isPinned = Boolean(pinnedPhoto && pinnedPhoto.hasGps !== false);
    if (wasPinned.current && !isPinned) {
      ready.current = false;
      lockOverview.current = true;
      setView({
        longitude: ALBUM_SOUTH_CENTER[0],
        latitude: ALBUM_SOUTH_CENTER[1],
        zoom: ALBUM_OVERVIEW_ZOOM,
      });
      setMapEpoch((epoch) => epoch + 1);
      wasPinned.current = false;
      return;
    }
    wasPinned.current = isPinned;

    const map = mapRef.current?.getMap();
    if (!map || !ready.current || !styleReady(map)) return;
    try {
      ensureLayers(map);
    } catch {
      return;
    }
    if (!map.getSource(PIN_SOURCE)) return;
    (map.getSource(PIN_SOURCE) as GeoJSONSource).setData(pinCollection(pinnedPhoto));
    if (pinColor && map.getLayer(PIN_LAYER)) {
      map.setPaintProperty(PIN_LAYER, "circle-color", pinColor);
    }
    map.stop();
    applyAlbumPinView(map, isPinned);
    if (isPinned && pinnedPhoto) {
      lockOverview.current = false;
      setView({
        longitude: pinnedPhoto.lng,
        latitude: pinnedPhoto.lat,
        zoom: PIN_ZOOM,
      });
      flyToPhoto(map, pinnedPhoto);
      return;
    }
    lockOverview.current = true;
    setView({
      longitude: ALBUM_SOUTH_CENTER[0],
      latitude: ALBUM_SOUTH_CENTER[1],
      zoom: ALBUM_OVERVIEW_ZOOM,
    });
    jumpToSouthOverview(map);
    map.resize();
    map.triggerRepaint();
    const unlock = window.setTimeout(() => {
      lockOverview.current = false;
    }, 80);
    return () => window.clearTimeout(unlock);
  }, [pinnedPhoto, pinColor]);

  if (!MAPBOX_TOKEN) {
    return <div className="h-full w-full bg-white" />;
  }

  return (
    <div className="pointer-events-none h-full w-full overflow-hidden bg-white">
      <Map
        key={mapEpoch}
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={PREVIEW_MAP_STYLE}
        longitude={view.longitude}
        latitude={view.latitude}
        zoom={view.zoom}
        onMove={(event) => {
          if (lockOverview.current) return;
          const next = event.viewState;
          setView({
            longitude: next.longitude,
            latitude: next.latitude,
            zoom: next.zoom,
          });
        }}
        minZoom={4}
        maxZoom={Math.max(PIN_ZOOM, 15)}
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
        style={{ width: "100%", height: "100%" }}
        onLoad={(event) => {
          const map = event.target;
          map.dragPan.disable();
          map.scrollZoom.disable();
          map.boxZoom.disable();
          map.dragRotate.disable();
          map.keyboard.disable();
          map.doubleClickZoom.disable();
          map.touchZoomRotate.disable();
          map.resize();
          ensureLayers(map);
          (map.getSource(PHOTO_SOURCE) as GeoJSONSource).setData(
            photoCollection(photosRef.current, hexRef.current),
          );
          (map.getSource(PIN_SOURCE) as GeoJSONSource).setData(pinCollection(pinnedRef.current));
          const pinned = Boolean(pinnedRef.current && pinnedRef.current.hasGps !== false);
          applyAlbumPinView(map, pinned);
          if (pinned && pinnedRef.current) flyToPhoto(map, pinnedRef.current);
          else {
            lockOverview.current = true;
            jumpToSouthOverview(map);
            setView({
              longitude: ALBUM_SOUTH_CENTER[0],
              latitude: ALBUM_SOUTH_CENTER[1],
              zoom: ALBUM_OVERVIEW_ZOOM,
            });
            window.setTimeout(() => {
              lockOverview.current = false;
            }, 80);
          }
          ready.current = true;
        }}
      />
    </div>
  );
}
