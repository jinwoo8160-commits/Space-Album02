/**
 * 한 스타일 안에서만 레이어를 켜고 끕니다. setStyle 은 쓰지 않습니다.
 *
 * 줌 0~9.5: 흰 캔버스 + 투명 수역(해안선 쿼리) + 도트.
 * 줌 9.5+: 같은 흰 바탕 위에 연한 수역·도로·건물·라벨만 켭니다. 위성 없음.
 */
import type { StyleSpecification } from "mapbox-gl";

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAPBOX_STREETS_SOURCE = "mapbox-streets";
export const WATER_QUERY_LAYER = "water-query";
export const DETAIL_WATER_LAYER = "detail-water";
export const DETAIL_BUILDING_LAYER = "detail-buildings";
export const DETAIL_ROAD_LAYER = "detail-roads";
export const DETAIL_ADMIN_LAYER = "detail-admin";
export const DETAIL_PLACE_LAYER = "detail-place-label";

export const DETAIL_LAYER_IDS = [
  DETAIL_WATER_LAYER,
  DETAIL_BUILDING_LAYER,
  DETAIL_ADMIN_LAYER,
  DETAIL_ROAD_LAYER,
  DETAIL_PLACE_LAYER,
] as const;

export const LAND_GRID_SOURCE = "land-grid";
export const LAND_GRID_LAYER = "land-grid-circles";

export const DOT_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "spacetime-minimal-light",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  sprite: "mapbox://sprites/mapbox/light-v11",
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
    {
      id: DETAIL_WATER_LAYER,
      type: "fill",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "water",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#f2f2f2",
        "fill-opacity": 1,
      },
    },
    {
      id: DETAIL_BUILDING_LAYER,
      type: "fill",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "building",
      minzoom: 9,
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#ececec",
        "fill-opacity": 1,
        "fill-outline-color": "#e4e4e4",
      },
    },
    {
      id: DETAIL_ADMIN_LAYER,
      type: "line",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "admin",
      minzoom: 9,
      layout: { visibility: "none", "line-cap": "round" },
      paint: {
        "line-color": "#e4e4e4",
        "line-width": 0.8,
        "line-opacity": 0.9,
      },
    },
    {
      id: DETAIL_ROAD_LAYER,
      type: "line",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "road",
      minzoom: 9,
      layout: { visibility: "none", "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#d6d6d6",
        "line-opacity": 1,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.5, 12, 1.15, 16, 4.5],
      },
    },
    {
      id: DETAIL_PLACE_LAYER,
      type: "symbol",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "place_label",
      minzoom: 9,
      layout: {
        visibility: "none",
        "text-field": ["coalesce", ["get", "name_ko"], ["get", "name"]],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 11, 14, 15],
        "text-padding": 10,
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#737373",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.4,
      },
    },
  ],
};
