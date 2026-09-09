import { COUNTRY_BY_ID } from "@/data/country-masks";
import { approxDistance } from "@/lib/geo";
import { MAPBOX_STREETS_SOURCE, WATER_QUERY_LAYER } from "@/lib/map-style";
import type { CountryId, Photo } from "@/types/album";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { Map as MapboxMap } from "mapbox-gl";

/**
 * 국가 bounding box 안의 위경도 격자. 줌/팬마다 다시 만들지 않습니다.
 * 해안선은 Mapbox streets 수역 폴리곤의 반대로 남깁니다.
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치 — GRID_CELLS, 기본 opacity
 */
export const DOT_RADIUS_PX = 1.85;
const GRID_CELLS = 110;

export type LandDotProps = { count: number };

export function buildLandDotGrid(
  map: MapboxMap,
  photos: Photo[],
  countryId: CountryId,
): FeatureCollection<Point, LandDotProps> {
  const bounds = COUNTRY_BY_ID[countryId].bounds;
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const step = Math.max(latSpan, lngSpan) / GRID_CELLS;
  const influence = step * 6.5;

  const water = queryWaterPolygons(map);

  const features: Feature<Point, LandDotProps>[] = [];
  let index = 0;

  for (let lat = bounds.minLat + step / 2; lat < bounds.maxLat; lat += step) {
    for (let lng = bounds.minLng + step / 2; lng < bounds.maxLng; lng += step) {
      if (isInWater(lng, lat, water)) continue;

      let count = 0;
      for (const photo of photos) {
        if (approxDistance({ lat, lng }, photo) <= influence) count += 1;
      }

      features.push({
        type: "Feature",
        id: index,
        properties: { count },
        geometry: { type: "Point", coordinates: [lng, lat] },
      });
      index += 1;
    }
  }

  return { type: "FeatureCollection", features };
}

function queryWaterPolygons(map: MapboxMap): GeoJSON.Feature[] {
  try {
    const canvas = map.getCanvas();
    const rendered = map.queryRenderedFeatures(
      [
        [0, 0],
        [canvas.clientWidth, canvas.clientHeight],
      ],
      { layers: [WATER_QUERY_LAYER] },
    );
    if (rendered.length > 0) return rendered;
  } catch {
    // ignore
  }
  return map.querySourceFeatures(MAPBOX_STREETS_SOURCE, { sourceLayer: "water" });
}

function isInWater(lng: number, lat: number, water: GeoJSON.Feature[]): boolean {
  const point: [number, number] = [lng, lat];
  for (const feature of water) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    if (geometry.type === "Polygon") {
      if (pointInPolygon(point, geometry.coordinates)) return true;
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates) {
        if (pointInPolygon(point, polygon)) return true;
      }
    }
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
