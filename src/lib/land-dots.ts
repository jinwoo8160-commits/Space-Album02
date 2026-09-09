import { COUNTRY_BY_ID } from "@/data/country-masks";
import {
  isInKoreaTerritory,
  KOREA_GRID_BOUNDS,
  KOREA_ISLAND_SEEDS,
} from "@/data/korea-territory";
import { approxDistance } from "@/lib/geo";
import { MAPBOX_STREETS_SOURCE, WATER_QUERY_LAYER } from "@/lib/map-style";
import type { CountryId, Photo } from "@/types/album";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { Map as MapboxMap } from "mapbox-gl";

/**
 * 국가는 bounding box 로 훑되, 한국은 한반도 영토 폴리곤 안에만 점을 남깁니다.
 * 줌/팬마다 다시 만들지 않습니다.
 */
export const DOT_RADIUS_PX = 1.85;
const GRID_CELLS = 130;

export type LandDotProps = { count: number };

export function buildLandDotGrid(
  map: MapboxMap,
  photos: Photo[],
  countryId: CountryId,
): FeatureCollection<Point, LandDotProps> {
  const bounds = countryId === "kr" ? KOREA_GRID_BOUNDS : COUNTRY_BY_ID[countryId].bounds;
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const step = Math.max(latSpan, lngSpan) / GRID_CELLS;
  const influence = step * 6.5;

  const water = queryWaterPolygons(map);

  const features: Feature<Point, LandDotProps>[] = [];
  let index = 0;

  for (let lat = bounds.minLat + step / 2; lat < bounds.maxLat; lat += step) {
    for (let lng = bounds.minLng + step / 2; lng < bounds.maxLng; lng += step) {
      if (countryId === "kr" && !isInKoreaTerritory(lng, lat)) continue;
      if (isInWater(lng, lat, water)) continue;

      features.push(makeDot(index, lng, lat, photos, influence));
      index += 1;
    }
  }

  if (countryId === "kr") {
    for (const seed of KOREA_ISLAND_SEEDS) {
      const already = features.some(
        (feature) =>
          Math.abs(feature.geometry.coordinates[0]! - seed.lng) < step * 0.6 &&
          Math.abs(feature.geometry.coordinates[1]! - seed.lat) < step * 0.6,
      );
      if (already) continue;
      features.push(makeDot(index, seed.lng, seed.lat, photos, influence));
      index += 1;
    }
  }

  return { type: "FeatureCollection", features };
}

function makeDot(
  id: number,
  lng: number,
  lat: number,
  photos: Photo[],
  influence: number,
): Feature<Point, LandDotProps> {
  let count = 0;
  for (const photo of photos) {
    if (approxDistance({ lat, lng }, photo) <= influence) count += 1;
  }
  return {
    type: "Feature",
    id,
    properties: { count },
    geometry: { type: "Point", coordinates: [lng, lat] },
  };
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
