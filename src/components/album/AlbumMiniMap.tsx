"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { ALBUM_LAND_RADIUS, ALBUM_MINI_MAP_PX, KOREA_ALBUM_LAND_DOTS } from "@/lib/album-land";
import { ALBUM_OVERVIEW_ZOOM, ALBUM_SOUTH_CENTER } from "@/lib/album-period";
import { CATEGORY_HEX, hexForCategory } from "@/lib/categories";
import { MAPBOX_TOKEN } from "@/lib/map-style";
import { PREVIEW_MAP_STYLE } from "@/lib/preview-dots";
import { PIN_ZOOM } from "@/lib/zoom";
import type { Photo } from "@/types/album";
import type { FeatureCollection, Point } from "geojson";
import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";

const LAND_SOURCE = "album-land-dots-v5";
const LAND_LAYER = "album-land-circles-v5";
const LAND_DOT_COLOR = "#6e6e6e";
const PHOTO_SOURCE = "album-photo-dots";
const PHOTO_LAYER = "album-photo-circles";

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

function styleReady(map: MapboxMap) {
  try {
    return Boolean(map.isStyleLoaded() && map.getStyle());
  } catch {
    return false;
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

function satelliteStaticUrl(photo: Photo, width: number, height: number) {
  const w = Math.max(1, Math.min(1280, Math.round(width)));
  const h = Math.max(1, Math.min(1280, Math.round(height)));
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${photo.lng},${photo.lat},${PIN_ZOOM},0/${w}x${h}@2x?access_token=${MAPBOX_TOKEN}`;
}

function ensureLayers(map: MapboxMap) {
  if (!styleReady(map)) return;
  const empty: FeatureCollection<Point> = { type: "FeatureCollection", features: [] };
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
}

function SatellitePinOverlay({
  photo,
  color,
  width,
  height,
}: {
  photo: Photo;
  color: string;
  width: number;
  height: number;
}) {
  const [ready, setReady] = useState(false);
  const src = satelliteStaticUrl(photo, width, height);

  useEffect(() => {
    setReady(false);
  }, [src]);

  return (
    <div className="absolute inset-0 bg-neutral-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onLoad={() => setReady(true)}
        className="h-full w-full object-cover transition-opacity duration-300"
        style={{ opacity: ready ? 1 : 0 }}
      />
      <span
        className="absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

/**
 * 앨범 중앙 남한 미리보기. 핀을 찍으면 위성 전경을 덮고, 해제하면 도트 지도가 그대로 드러납니다.
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
  const boxRef = useRef<HTMLDivElement | null>(null);
  const photosRef = useRef(photos);
  const hexRef = useRef(hexById);
  const ready = useRef(false);
  photosRef.current = photos;
  hexRef.current = hexById;

  const [size, setSize] = useState({ width: 390, height: ALBUM_MINI_MAP_PX });
  const isPinned = Boolean(pinnedPhoto && pinnedPhoto.hasGps !== false);

  useEffect(() => {
    const node = boxRef.current;
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      setSize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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

  if (!MAPBOX_TOKEN) {
    return <div className="h-full w-full bg-white" />;
  }

  return (
    <div ref={boxRef} className="pointer-events-none relative h-full w-full overflow-hidden bg-white">
      <div className="h-full w-full">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={PREVIEW_MAP_STYLE}
          longitude={ALBUM_SOUTH_CENTER[0]}
          latitude={ALBUM_SOUTH_CENTER[1]}
          zoom={ALBUM_OVERVIEW_ZOOM}
          minZoom={ALBUM_OVERVIEW_ZOOM}
          maxZoom={ALBUM_OVERVIEW_ZOOM}
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
            jumpToSouthOverview(map);
            ready.current = true;
          }}
        />
      </div>
      {isPinned && pinnedPhoto ? (
        <SatellitePinOverlay
          photo={pinnedPhoto}
          color={pinColor ?? "#111111"}
          width={size.width}
          height={size.height}
        />
      ) : null}
    </div>
  );
}
