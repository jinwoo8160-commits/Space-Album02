/**
 * 줌 0~7: 흰 캔버스 + 수역(해안선 쿼리).
 * 줌 9.5+: 같은 스타일 안의 위성·도로·라벨을 visibility 로만 켭니다.
 * setStyle 을 부르면 블랙아웃이 나서, 레이어 숨김/표시만 씁니다.
 */
import type { StyleSpecification } from "mapbox-gl";

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAPBOX_STREETS_SOURCE = "mapbox-streets";
export const MAPBOX_SATELLITE_SOURCE = "mapbox-satellite";
export const WATER_QUERY_LAYER = "water-query";
export const SATELLITE_LAYER = "satellite";
export const SAT_ROAD_LAYER = "sat-roads";
export const SAT_BUILDING_LAYER = "sat-buildings";
export const SAT_PLACE_LAYER = "sat-place-label";

export const DETAIL_LAYER_IDS = [
  SATELLITE_LAYER,
  SAT_BUILDING_LAYER,
  SAT_ROAD_LAYER,
  SAT_PLACE_LAYER,
] as const;

export const LAND_GRID_SOURCE = "land-grid";
export const LAND_GRID_LAYER = "land-grid-circles";
export const PHOTO_DOTS_SOURCE = "photo-dots";
export const PHOTO_DOTS_LAYER = "photo-dots-circles";

export const DOT_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "spacetime-dot-land",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  sprite: "mapbox://sprites/mapbox/satellite-streets-v12",
  sources: {
    [MAPBOX_STREETS_SOURCE]: {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8",
    },
    [MAPBOX_SATELLITE_SOURCE]: {
      type: "raster",
      url: "mapbox://mapbox.satellite",
      tileSize: 256,
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
      id: SATELLITE_LAYER,
      type: "raster",
      source: MAPBOX_SATELLITE_SOURCE,
      layout: { visibility: "none" },
      paint: { "raster-opacity": 1, "raster-fade-duration": 0 },
    },
    {
      id: SAT_BUILDING_LAYER,
      type: "fill",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "building",
      minzoom: 9,
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#0d0d0d",
        "fill-opacity": 0.28,
      },
    },
    {
      id: SAT_ROAD_LAYER,
      type: "line",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "road",
      minzoom: 9,
      layout: { visibility: "none", "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#f4f4f4",
        "line-opacity": 0.55,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.4, 14, 2.2, 17, 8],
      },
    },
    {
      id: SAT_PLACE_LAYER,
      type: "symbol",
      source: MAPBOX_STREETS_SOURCE,
      "source-layer": "place_label",
      minzoom: 9,
      layout: {
        visibility: "none",
        "text-field": ["coalesce", ["get", "name_ko"], ["get", "name"]],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 11, 14, 16],
        "text-padding": 8,
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "#111111",
        "text-halo-width": 1.15,
      },
    },
  ],
};
