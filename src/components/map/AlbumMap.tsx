"use client";

import { PhotoClusterMarker } from "@/components/map/PhotoClusterMarker";
import { PhotoPin } from "@/components/map/PhotoPin";
import { COUNTRY_BY_ID } from "@/data/country-masks";
import { useMap } from "@/context/map-context";
import { clusterPhotos } from "@/lib/clustering";
import { countryBounds, photosToDensityGeoJSON } from "@/lib/density-dots";
import { CARTO_LIGHT_STYLE, loadMinimalGrayStyle } from "@/lib/map-style";
import { DEFAULT_MAP_ZOOM, DOT_MAX_ZOOM } from "@/lib/zoom";
import type { CircleLayerSpecification, StyleSpecification } from "maplibre-gl";
import { useEffect, useMemo, useState } from "react";
import Map, { Layer, Marker, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * 실제 지도(해안선·지형) 위에 줌 구간별 레이어를 올립니다.
 *
 * Circle Layer 를 HTML 점이 아니라 지도 엔진에 넣는 이유:
 * 엔진이 GPU 로 그리므로 2~4px 점도 선명하고, 줌과 함께 부드럽게 움직입니다.
 * maxzoom: 6 이면 줌 6부터 이 레이어는 자동으로 사라집니다. (요구사항 0~5)
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * 점 크기 = circle-radius, 진하기 = circle-opacity, 지도 회색조 = MAP_STYLE
 */
const DOT_LAYER: Omit<CircleLayerSpecification, "source"> = {
  id: "photo-dots",
  type: "circle",
  maxzoom: DOT_MAX_ZOOM,
  paint: {
    // 반지름은 px 고정. 줌이 올라도 커져서 해안선을 가리지 않습니다.
    "circle-radius": 2.4,
    "circle-blur": 0,
    "circle-color": "#111111",
    // 밀도는 크기 대신 진하기(opacity)로만 표현합니다.
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["get", "count"],
      1,
      0.35,
      2,
      0.55,
      4,
      0.78,
      8,
      0.95,
    ],
    "circle-stroke-width": 0,
    "circle-pitch-alignment": "viewport",
    "circle-pitch-scale": "viewport",
  },
};

export function AlbumMap() {
  const {
    filteredPhotos,
    overlayMode,
    mapZoom,
    mapRef,
    setMapZoom,
    flyToClusters,
    flyToPins,
    openPhoto,
    selectedCountryId,
  } = useMap();

  const [style, setStyle] = useState<StyleSpecification>(CARTO_LIGHT_STYLE);

  useEffect(() => {
    let cancelled = false;
    loadMinimalGrayStyle().then((next) => {
      if (!cancelled) setStyle(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const country = COUNTRY_BY_ID[selectedCountryId];

  const density = useMemo(() => photosToDensityGeoJSON(filteredPhotos), [filteredPhotos]);
  const clusters = useMemo(
    () => clusterPhotos(filteredPhotos, overlayMode, mapZoom),
    [filteredPhotos, overlayMode, mapZoom],
  );

  return (
    <Map
      ref={mapRef}
      mapStyle={style}
      initialViewState={{
        longitude: (country.bounds.minLng + country.bounds.maxLng) / 2,
        latitude: (country.bounds.minLat + country.bounds.maxLat) / 2,
        zoom: DEFAULT_MAP_ZOOM,
      }}
      minZoom={1.2}
      maxZoom={16}
      attributionControl={{ compact: true }}
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

      {overlayMode !== "dots"
        ? clusters.map((cluster) => (
            <Marker
              key={cluster.id}
              longitude={cluster.lng}
              latitude={cluster.lat}
              anchor="center"
            >
              {overlayMode === "pins" && cluster.photos.length === 1 ? (
                <PhotoPin
                  photo={cluster.photos[0]!}
                  onClick={() => openPhoto(cluster.photos[0]!.id)}
                />
              ) : (
                <PhotoClusterMarker
                  cluster={cluster}
                  onClick={() => {
                    if (overlayMode === "clusters") flyToPins(cluster.lat, cluster.lng);
                    else openPhoto(cluster.photos[0]!.id);
                  }}
                />
              )}
            </Marker>
          ))
        : null}
    </Map>
  );
}
