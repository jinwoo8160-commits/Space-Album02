import {
  DETAIL_ADMIN_LAYER,
  DETAIL_BUILDING_LAYER,
  DETAIL_PLACE_LAYER,
  DETAIL_ROAD_LAYER,
  DETAIL_WATER_LAYER,
  LAND_GRID_LAYER,
  WATER_QUERY_LAYER,
} from "@/lib/map-style";
import { UNCLASSIFIED_HEX } from "@/lib/categories";
import type { ExpressionSpecification, Map as MapboxMap } from "mapbox-gl";

export type MapBaseTheme = "light" | "dark";

const THEME_PAINT = {
  light: {
    background: "#ffffff",
    water: "#ffffff",
    detailWater: "#f2f2f2",
    building: "#ececec",
    buildingOutline: "#e4e4e4",
    admin: "#e4e4e4",
    road: "#d6d6d6",
    label: "#737373",
    labelHalo: "#ffffff",
    landDot: "#111111",
  },
  dark: {
    background: "#111111",
    water: "#111111",
    detailWater: "#1a1a1a",
    building: "#2a2a2a",
    buildingOutline: "#333333",
    admin: "#3a3a3a",
    road: "#4a4a4a",
    label: "#a3a3a3",
    labelHalo: "#111111",
    landDot: "#e8e8e8",
  },
} as const;

export function landDotColorExpr(theme: MapBaseTheme): ExpressionSpecification {
  const fallback = THEME_PAINT[theme].landDot;
  return [
    "case",
    ["==", ["get", "color"], UNCLASSIFIED_HEX],
    fallback,
    ["to-color", ["coalesce", ["get", "color"], fallback]],
  ];
}

function setPaint(
  map: MapboxMap,
  layerId: string,
  prop: "fill-color" | "fill-outline-color" | "line-color" | "text-color" | "text-halo-color",
  value: string,
) {
  if (!map.getLayer(layerId)) return;
  map.setPaintProperty(layerId, prop, value);
}

/**
 * 같은 스타일 객체 안에서 색만 바꿉니다. setStyle 은 쓰지 않습니다.
 */
export function applyMapTheme(map: MapboxMap, theme: MapBaseTheme) {
  const paint = THEME_PAINT[theme];
  if (map.getLayer("background")) {
    map.setPaintProperty("background", "background-color", paint.background);
  }
  setPaint(map, WATER_QUERY_LAYER, "fill-color", paint.water);
  setPaint(map, DETAIL_WATER_LAYER, "fill-color", paint.detailWater);
  setPaint(map, DETAIL_BUILDING_LAYER, "fill-color", paint.building);
  setPaint(map, DETAIL_BUILDING_LAYER, "fill-outline-color", paint.buildingOutline);
  setPaint(map, DETAIL_ADMIN_LAYER, "line-color", paint.admin);
  setPaint(map, DETAIL_ROAD_LAYER, "line-color", paint.road);
  setPaint(map, DETAIL_PLACE_LAYER, "text-color", paint.label);
  setPaint(map, DETAIL_PLACE_LAYER, "text-halo-color", paint.labelHalo);
  if (map.getLayer(LAND_GRID_LAYER)) {
    map.setPaintProperty(LAND_GRID_LAYER, "circle-color", landDotColorExpr(theme));
  }
  const canvas = map.getCanvas();
  canvas.style.background = paint.background;
}
