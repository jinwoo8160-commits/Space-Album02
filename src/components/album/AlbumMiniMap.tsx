"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { ALBUM_OVERVIEW_ZOOM } from "@/lib/album-period";
import {
  applyPreviewCountryFilter,
  buildPreviewDotGrid,
  PREVIEW_DOT_LAYER,
  PREVIEW_DOT_SOURCE,
  PREVIEW_MAP_STYLE,
} from "@/lib/preview-dots";
import { MAPBOX_TOKEN } from "@/lib/map-style";
import { KOREA_HOME_CENTER, PIN_ZOOM } from "@/lib/zoom";
import type { Photo } from "@/types/album";
import type { FeatureCollection, Point } from "geojson";
import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";

const PHOTO_SOURCE = "album-photo-dots";
const PHOTO_LAYER = "album-photo-circles";
const PIN_SOURCE = "album-pin-dot";
const PIN_LAYER = "album-pin-circle";

function photoCollection(photos: Photo[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: photos
      .filter((photo) => photo.hasGps !== false)
      .map((photo) => ({
        type: "Feature",
        id: photo.id,
        properties: { id: photo.id },
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

function ensureLayers(map: MapboxMap) {
  applyPreviewCountryFilter(map, "kr");
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
        "circle-radius": 1.25,
        "circle-pitch-alignment": "viewport",
        "circle-color": "#c4c4c4",
        "circle-opacity": ["interpolate", ["linear"], ["zoom"], 5.3, 0.9, 8, 0.25, 10, 0],
      },
    });
  }
  if (!map.getSource(PHOTO_SOURCE)) {
    map.addSource(PHOTO_SOURCE, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  }
  if (!map.getLayer(PHOTO_LAYER)) {
    map.addLayer({
      id: PHOTO_LAYER,
      type: "circle",
      source: PHOTO_SOURCE,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5.3, 2.35, 9, 4, 12.6, 7],
        "circle-pitch-alignment": "viewport",
        "circle-color": "#111111",
        "circle-opacity": 0.92,
      },
    });
  }
  if (!map.getSource(PIN_SOURCE)) {
    map.addSource(PIN_SOURCE, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  }
  if (!map.getLayer(PIN_LAYER)) {
    map.addLayer({
      id: PIN_LAYER,
      type: "circle",
      source: PIN_SOURCE,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5.3, 3.2, 12.6, 9],
        "circle-pitch-alignment": "viewport",
        "circle-color": "#111111",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
}

/**
 * 앨범 탭 중앙 한반도 미니 지도.
 * 기본 줌 5.3, 핀을 누르면 지도 탭과 같은 사진 확대 줌으로 이동합니다.
 */
export function AlbumMiniMap({
  photos,
  pinnedPhoto,
  pinColor,
}: {
  photos: Photo[];
  pinnedPhoto: Photo | null;
  pinColor?: string | null;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const photosRef = useRef(photos);
  const pinnedRef = useRef(pinnedPhoto);
  const cameraReady = useRef(false);
  photosRef.current = photos;
  pinnedRef.current = pinnedPhoto;

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map?.getSource(PHOTO_SOURCE)) return;
    (map.getSource(PHOTO_SOURCE) as GeoJSONSource).setData(photoCollection(photos));
  }, [photos]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map?.getSource(PIN_SOURCE)) return;
    (map.getSource(PIN_SOURCE) as GeoJSONSource).setData(pinCollection(pinnedPhoto));
    if (pinColor && map.getLayer(PIN_LAYER)) {
      map.setPaintProperty(PIN_LAYER, "circle-color", pinColor);
    }
    if (!map.isStyleLoaded() || !cameraReady.current) return;
    if (pinnedPhoto && pinnedPhoto.hasGps !== false) {
      map.easeTo({
        center: [pinnedPhoto.lng, pinnedPhoto.lat],
        zoom: PIN_ZOOM,
        duration: 720,
        essential: true,
      });
      return;
    }
    map.easeTo({
      center: KOREA_HOME_CENTER,
      zoom: ALBUM_OVERVIEW_ZOOM,
      duration: 520,
      essential: true,
    });
  }, [pinnedPhoto, pinColor]);

  if (!MAPBOX_TOKEN) {
    return <div className="h-full w-full bg-white" />;
  }

  return (
    <div className="h-full w-full overflow-hidden bg-white">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={PREVIEW_MAP_STYLE}
        initialViewState={{
          longitude: KOREA_HOME_CENTER[0],
          latitude: KOREA_HOME_CENTER[1],
          zoom: ALBUM_OVERVIEW_ZOOM,
        }}
        minZoom={ALBUM_OVERVIEW_ZOOM}
        maxZoom={PIN_ZOOM}
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
          ensureLayers(map);
          (map.getSource(PHOTO_SOURCE) as GeoJSONSource | undefined)?.setData(
            photoCollection(photosRef.current),
          );
          (map.getSource(PIN_SOURCE) as GeoJSONSource | undefined)?.setData(
            pinCollection(pinnedRef.current),
          );
          map.jumpTo({ center: KOREA_HOME_CENTER, zoom: ALBUM_OVERVIEW_ZOOM });
          cameraReady.current = true;
          const paintLand = () => {
            const data = buildPreviewDotGrid(map, "kr");
            if (data.features.length === 0) return false;
            (map.getSource(PREVIEW_DOT_SOURCE) as GeoJSONSource | undefined)?.setData(data);
            return true;
          };
          map.once("idle", () => {
            if (paintLand()) return;
            map.once("idle", paintLand);
          });
        }}
      />
    </div>
  );
}
