import { COUNTRY_BY_ID, WORLD_COUNTRY } from "@/data/country-masks";
import {
  isForeignIsland,
  isInKoreaTerritory,
  KOREA_GRID_BOUNDS,
  KOREA_ISLAND_SEEDS,
} from "@/data/korea-territory";
import { MAPBOX_STREETS_SOURCE, WATER_QUERY_LAYER } from "@/lib/map-style";
import type { CountryId, GeoBounds } from "@/types/album";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { FilterSpecification, Map as MapboxMap, StyleSpecification } from "mapbox-gl";

/** 국가 선택 모달의 미니 지도. 메인 지도의 사진 밀도 격자와는 별개입니다. */
export type PreviewMapId = CountryId | "world";

export const PREVIEW_DOT_SOURCE = "preview-dots";
export const PREVIEW_DOT_LAYER = "preview-dot-circles";
export const PREVIEW_COUNTRY_SOURCE = "preview-countries";
export const PREVIEW_COUNTRY_FILL = "preview-country-fill";

const WORLDVIEW_FILTER: FilterSpecification = [
  "any",
  ["==", ["get", "worldview"], "all"],
  ["in", "US", ["get", "worldview"]],
];

const ISO_BY_PREVIEW: Record<PreviewMapId, string[] | null> = {
  world: null,
  kr: ["KR", "KP"],
  jp: ["JP"],
  cn: ["CN"],
  us: ["US"],
};

const GRID_CELLS: Record<PreviewMapId, number> = {
  world: 58,
  kr: 20,
  jp: 24,
  cn: 34,
  us: 34,
};

export const PREVIEW_DOT_RADIUS: Record<PreviewMapId, number> = {
  world: 1.15,
  kr: 1.35,
  jp: 1.3,
  cn: 1.25,
  us: 1.25,
};

const FIT_MAX_ZOOM: Record<PreviewMapId, number> = {
  world: 1.55,
  kr: 5.35,
  jp: 4.15,
  cn: 2.55,
  us: 2.75,
};

/** 일본은 대마도·한반도가 빠지도록 본토 쪽으로 조금 좁힙니다. */
function previewBounds(id: PreviewMapId): GeoBounds {
  if (id === "world") return WORLD_COUNTRY.bounds;
  if (id === "kr") return KOREA_GRID_BOUNDS;
  if (id === "jp") {
    return { minLat: 30.4, maxLat: 45.6, minLng: 129.55, maxLng: 146.0 };
  }
  return COUNTRY_BY_ID[id].bounds;
}

export function previewFitBounds(id: PreviewMapId): {
  bounds: [[number, number], [number, number]];
  maxZoom: number;
} {
  const bounds = previewBounds(id);
  return {
    bounds: [
      [bounds.minLng, bounds.minLat],
      [bounds.maxLng, bounds.maxLat],
    ],
    maxZoom: FIT_MAX_ZOOM[id],
  };
}

export function previewCountryFilter(id: PreviewMapId): FilterSpecification {
  const iso = ISO_BY_PREVIEW[id];
  if (!iso) return WORLDVIEW_FILTER;
  return ["all", WORLDVIEW_FILTER, ["in", ["get", "iso_3166_1"], ["literal", iso]]];
}

export const PREVIEW_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "spacetime-country-preview",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  sprite: "mapbox://sprites/mapbox/light-v11",
  sources: {
    [MAPBOX_STREETS_SOURCE]: {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8",
    },
    [PREVIEW_COUNTRY_SOURCE]: {
      type: "vector",
      url: "mapbox://mapbox.country-boundaries-v1",
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
      id: PREVIEW_COUNTRY_FILL,
      type: "fill",
      source: PREVIEW_COUNTRY_SOURCE,
      "source-layer": "country_boundaries",
      paint: {
        "fill-color": "#ffffff",
        "fill-opacity": 0,
      },
    },
  ],
};

export function applyPreviewCountryFilter(map: MapboxMap, id: PreviewMapId) {
  if (!map.getLayer(PREVIEW_COUNTRY_FILL)) return;
  map.setFilter(PREVIEW_COUNTRY_FILL, previewCountryFilter(id));
}

export function buildPreviewDotGrid(map: MapboxMap, id: PreviewMapId): FeatureCollection<Point> {
  const bounds = previewBounds(id);
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const step = Math.max(latSpan, lngSpan) / GRID_CELLS[id];
  const originLat = bounds.minLat + step / 2;
  const originLng = bounds.minLng + step / 2;
  const polygons = queryTerritoryPolygons(map, id);

  const cells: { lng: number; lat: number }[] = [];
  const seen = new Set<string>();

  const push = (lng: number, lat: number) => {
    const col = Math.round((lng - originLng) / step);
    const row = Math.round((lat - originLat) / step);
    const key = `${row}:${col}`;
    if (seen.has(key)) return;
    seen.add(key);
    cells.push({ lng, lat });
  };

  for (let lat = originLat; lat < bounds.maxLat; lat += step) {
    for (let lng = originLng; lng < bounds.maxLng; lng += step) {
      if (!isPreviewLand(id, lng, lat, polygons)) continue;
      push(lng, lat);
    }
  }

  if (id === "kr") {
    for (const seed of KOREA_ISLAND_SEEDS) {
      push(seed.lng, seed.lat);
    }
  }

  return {
    type: "FeatureCollection",
    features: cells.map((cell, index) => ({
      type: "Feature",
      id: index,
      properties: {},
      geometry: { type: "Point", coordinates: [cell.lng, cell.lat] },
    })),
  };
}

function isPreviewLand(
  id: PreviewMapId,
  lng: number,
  lat: number,
  polygons: GeoJSON.Feature[],
): boolean {
  if (id === "kr") return isInKoreaTerritory(lng, lat);
  if (isForeignIsland(lng, lat)) return false;
  if (id === "jp" && isInKoreaTerritory(lng, lat)) return false;
  if (polygons.length === 0) return false;
  return polygons.some((feature) => featureContains(feature, lng, lat));
}

function queryTerritoryPolygons(map: MapboxMap, id: PreviewMapId): GeoJSON.Feature[] {
  if (id === "kr") return [];
  try {
    const filter = previewCountryFilter(id);
    const canvas = map.getCanvas();
    const fromLayer = map.queryRenderedFeatures(
      [
        [0, 0],
        [canvas.clientWidth, canvas.clientHeight],
      ],
      { layers: [PREVIEW_COUNTRY_FILL] },
    );
    if (fromLayer.length > 0) return fromLayer;
    return map.querySourceFeatures(PREVIEW_COUNTRY_SOURCE, {
      sourceLayer: "country_boundaries",
      filter,
    });
  } catch {
    return [];
  }
}

function featureContains(feature: GeoJSON.Feature, lng: number, lat: number): boolean {
  const geometry = feature.geometry;
  if (!geometry) return false;
  const point: [number, number] = [lng, lat];
  if (geometry.type === "Polygon") return pointInPolygon(point, geometry.coordinates);
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
  }
  return false;
}

function pointInPolygon(point: [number, number], rings: GeoJSON.Position[][]): boolean {
  const outer = rings[0];
  if (!outer || !pointInRing(point, outer)) return false;
  for (let i = 1; i < rings.length; i += 1) {
    const hole = rings[i];
    if (hole && pointInRing(point, hole)) return false;
  }
  return true;
}

function pointInRing(point: [number, number], ring: GeoJSON.Position[]): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i]![0]!;
    const yi = ring[i]![1]!;
    const xj = ring[j]![0]!;
    const yj = ring[j]![1]!;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
