"use client";

import { PhotoClusterMarker } from "@/components/map/PhotoClusterMarker";
import { PhotoPin } from "@/components/map/PhotoPin";
import { COUNTRY_BY_ID } from "@/data/country-masks";
import { useMap } from "@/context/map-context";
import { clusterPhotos } from "@/lib/clustering";
import { countryBounds, photosToDensityGeoJSON } from "@/lib/density-dots";
import { MAPBOX_STYLE, MAPBOX_TOKEN } from "@/lib/map-style";
import {
  clusterLayerOpacity,
  DEFAULT_MAP_ZOOM,
  DOT_FADE_END,
  DOT_FADE_START,
  pinLayerOpacity,
} from "@/lib/zoom";
import type { CircleLayerSpecification } from "mapbox-gl";
import { useMemo } from "react";
import Map, { Layer, Marker, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * 공식 Mapbox GL JS 지도.
 *
 * 토큰: process.env.NEXT_PUBLIC_MAPBOX_TOKEN (.env.local)
 * 줌: Mapbox 기본 scrollZoom / touchZoomRotate — 휠·트랙패드·핀치가 연속 줌입니다.
 *
 * 도트 Circle Layer 의 opacity 는
 *  1) 사진 밀도(count)
 *  2) 줌 5.2→6.4 디졸브
 * 를 곱한 것처럼 zoom interpolate 로 한 번에 표현합니다.
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치 — MAPBOX_STYLE, circle-radius
 */
const DOT_LAYER: Omit<CircleLayerSpecification, "source"> = {
  id: "photo-dots",
  type: "circle",
  maxzoom: DOT_FADE_END + 0.15,
  paint: {
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 2.0, 5, 3.2],
    "circle-blur": 0,
    // Dark 스타일 위에서는 밝은 점이 보여야 합니다.
    "circle-color": "#f2f2f2",
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      ["interpolate", ["linear"], ["get", "count"], 1, 0.32, 2, 0.5, 4, 0.72, 8, 0.92],
      DOT_FADE_START,
      ["interpolate", ["linear"], ["get", "count"], 1, 0.32, 2, 0.5, 4, 0.72, 8, 0.92],
      DOT_FADE_END,
      0,
    ],
    "circle-stroke-width": 0,
    "circle-pitch-alignment": "viewport",
    "circle-pitch-scale": "viewport",
  },
};

export function AlbumMap() {
  const {
    filteredPhotos,
    mapZoom,
    mapRef,
    setMapZoom,
    flyToClusters,
    flyToPins,
    openPhoto,
    selectedCountryId,
  } = useMap();

  const country = COUNTRY_BY_ID[selectedCountryId];
  const density = useMemo(() => photosToDensityGeoJSON(filteredPhotos), [filteredPhotos]);

  const clusterOpacity = clusterLayerOpacity(mapZoom);
  const pinOpacity = pinLayerOpacity(mapZoom);

  const cityClusters = useMemo(
    () =>
      clusterOpacity > 0.02 ? clusterPhotos(filteredPhotos, "clusters", mapZoom) : [],
    [filteredPhotos, mapZoom, clusterOpacity],
  );
  const pinClusters = useMemo(
    () => (pinOpacity > 0.02 ? clusterPhotos(filteredPhotos, "pins", mapZoom) : []),
    [filteredPhotos, mapZoom, pinOpacity],
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#111] px-6 text-center text-sm text-neutral-400">
        `.env.local`에 NEXT_PUBLIC_MAPBOX_TOKEN 을 넣고 개발 서버를 다시 시작해 주세요.
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAPBOX_STYLE}
      initialViewState={{
        longitude: (country.bounds.minLng + country.bounds.maxLng) / 2,
        latitude: (country.bounds.minLat + country.bounds.maxLat) / 2,
        zoom: DEFAULT_MAP_ZOOM,
      }}
      minZoom={1.2}
      maxZoom={16}
      scrollZoom
      touchZoomRotate
      dragPan
      doubleClickZoom
      attributionControl
      interactiveLayerIds={["photo-dots"]}
      onLoad={(event) => {
        setMapZoom(event.target.getZoom());
        event.target.fitBounds(countryBounds(selectedCountryId), {
          padding: 48,
          maxZoom: 5.4,
          duration: 0,
        });
      }}
      onMove={(event) => setMapZoom(event.viewState.zoom)}
      onClick={(event) => {
        const feature = event.features?.[0];
        if (!feature || feature.layer?.id !== "photo-dots") return;
        const geometry = feature.geometry;
        if (geometry.type !== "Point") return;
        const [lng, lat] = geometry.coordinates;
        if (typeof lng !== "number" || typeof lat !== "number") return;
        flyToClusters(lat, lng);
      }}
      onMouseEnter={() => {
        const canvas = mapRef.current?.getCanvas();
        if (canvas) canvas.style.cursor = "pointer";
      }}
      onMouseLeave={() => {
        const canvas = mapRef.current?.getCanvas();
        if (canvas) canvas.style.cursor = "";
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <Source id="photo-density" type="geojson" data={density}>
        <Layer {...DOT_LAYER} />
      </Source>

      {cityClusters.map((cluster) => (
        <Marker
          key={`c-${cluster.id}`}
          longitude={cluster.lng}
          latitude={cluster.lat}
          anchor="center"
          pitchAlignment="viewport"
          rotationAlignment="viewport"
          style={{ pointerEvents: clusterOpacity > 0.35 ? "auto" : "none" }}
        >
          <div
            style={{
              opacity: clusterOpacity,
              transform: `scale(${0.86 + clusterOpacity * 0.14})`,
              transition: "opacity 80ms linear, transform 80ms linear",
            }}
          >
            <PhotoClusterMarker
              cluster={cluster}
              onClick={() => flyToPins(cluster.lat, cluster.lng)}
            />
          </div>
        </Marker>
      ))}

      {pinClusters.map((cluster) => (
        <Marker
          key={`p-${cluster.id}`}
          longitude={cluster.lng}
          latitude={cluster.lat}
          anchor="center"
          pitchAlignment="viewport"
          rotationAlignment="viewport"
          style={{ pointerEvents: pinOpacity > 0.4 ? "auto" : "none" }}
        >
          <div
            style={{
              opacity: pinOpacity,
              transform: `scale(${0.9 + pinOpacity * 0.1})`,
              transition: "opacity 80ms linear, transform 80ms linear",
            }}
          >
            {cluster.photos.length === 1 ? (
              <PhotoPin photo={cluster.photos[0]!} onClick={() => openPhoto(cluster.photos[0]!.id)} />
            ) : (
              <PhotoClusterMarker
                cluster={cluster}
                onClick={() => openPhoto(cluster.photos[0]!.id)}
              />
            )}
          </div>
        </Marker>
      ))}
    </Map>
  );
}
