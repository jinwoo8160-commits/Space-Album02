"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { buildKoreaAlbumLandDots } from "@/lib/album-land";
import { ALBUM_OVERVIEW_ZOOM } from "@/lib/album-period";
import { MAPBOX_TOKEN } from "@/lib/map-style";
import { PREVIEW_MAP_STYLE } from "@/lib/preview-dots";
import { KOREA_HOME_CENTER, PIN_ZOOM } from "@/lib/zoom";
import type { Photo } from "@/types/album";
import type { FeatureCollection, Point } from "geojson";
import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";

const LAND_SOURCE = "album-land-dots";
const LAND_LAYER = "album-land-circles";
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
  const empty: FeatureCollection<Point> = { type: "FeatureCollection", features: [] };
  if (!map.getSource(LAND_SOURCE)) {
    map.addSource(LAND_SOURCE, { type: "geojson", data: buildKoreaAlbumLandDots() });
  }
  if (!map.getLayer(LAND_LAYER)) {
    map.addLayer({
      id: LAND_LAYER,
      type: "circle",
      source: LAND_SOURCE,
      paint: {
        "circle-radius": 1.35,
        "circle-pitch-alignment": "viewport",
        "circle-color": "#c8c8c8",
        "circle-opacity": ["interpolate", ["linear"], ["zoom"], 5.3, 0.95, 8, 0.2, 10, 0],
      },
    });
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
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5.3, 2.2, 9, 4, 12.6, 7],
        "circle-pitch-alignment": "viewport",
        "circle-color": "#111111",
        "circle-opacity": 0.92,
      },
    });
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
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5.3, 3.4, 12.6, 9],
        "circle-pitch-alignment": "viewport",
        "circle-color": "#111111",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
}

/**
 * 앨범 중앙 한반도 미리보기. 기본 줌 5.3, 핀을 찍으면 지도 탭과 같은 확대 줌으로 갑니다.
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
  const ready = useRef(false);
  photosRef.current = photos;
  pinnedRef.current = pinnedPhoto;

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map?.getSource(PHOTO_SOURCE)) return;
    (map.getSource(PHOTO_SOURCE) as GeoJSONSource).setData(photoCollection(photos));
  }, [photos]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map?.getSource(PIN_SOURCE) || !ready.current) return;
    (map.getSource(PIN_SOURCE) as GeoJSONSource).setData(pinCollection(pinnedPhoto));
    if (pinColor && map.getLayer(PIN_LAYER)) {
      map.setPaintProperty(PIN_LAYER, "circle-color", pinColor);
    }
    if (pinnedPhoto && pinnedPhoto.hasGps !== false) {
      map.easeTo({
        center: [pinnedPhoto.lng, pinnedPhoto.lat],
        zoom: PIN_ZOOM,
        duration: 720,
        essential: true,
      });
      return;
    }
    map.jumpTo({ center: KOREA_HOME_CENTER, zoom: ALBUM_OVERVIEW_ZOOM });
  }, [pinnedPhoto, pinColor]);

  if (!MAPBOX_TOKEN) {
    return <div className="h-full w-full bg-white" />;
  }

  return (
    <div className="pointer-events-none h-full w-full overflow-hidden bg-white">
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
          (map.getSource(PHOTO_SOURCE) as GeoJSONSource).setData(photoCollection(photosRef.current));
          (map.getSource(PIN_SOURCE) as GeoJSONSource).setData(pinCollection(pinnedRef.current));
          map.jumpTo({ center: KOREA_HOME_CENTER, zoom: ALBUM_OVERVIEW_ZOOM });
          ready.current = true;
        }}
      />
    </div>
  );
}
