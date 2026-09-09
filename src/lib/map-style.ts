/**
 * 흰 캔버스 + Mapbox streets 수역 타일만 로드합니다.
 * 도로·라벨·지형·위성은 그리지 않습니다.
 * 해안선은 수역 폴리곤의 반대(육지)에 도트 격자를 심어 드러냅니다.
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치 — background-color
 */
import type { StyleSpecification } from "mapbox-gl";

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAPBOX_STREETS_SOURCE = "mapbox-streets";
export const WATER_QUERY_LAYER = "water-query";

export const DOT_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "spacetime-dot-land",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  sources: {
    [MAPBOX_STREETS_SOURCE]: {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#ffffff" },
    },
    {
      id: WATER_QUERY_LAYER,
      type: "fill",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "water",
      paint: {
        "fill-color": "#ffffff",
        "fill-opacity": 1,
      },
    },
  ],
};
