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
import type { ExpressionSpecification, Map as MapboxMap } from "mapbox-gl";

/**
 * 국가는 bounding box 로 훑되, 한국은 한반도 영토 폴리곤 안에만 점을 남깁니다.
 * 사진→가장 가까운 도트에 5x5 커널로 점수를 퍼뜨리고, 밀도 5단계는 격자 생성 시 1회만 계산합니다.
 */
export const DOT_RADIUS_PX = 1.85;
const GRID_CELLS = 130;

export type LandDotProps = {
  photoCount: number;
  totalScore: number;
  densityLevel: number;
  count: number;
};

export const DENSITY_OPACITY_EXPR: ExpressionSpecification = [
  "match",
  ["get", "densityLevel"],
  1,
  1.0,
  2,
  0.8,
  3,
  0.6,
  4,
  0.4,
  5,
  0.25,
  0.1,
];

const KERNEL_CENTER = 1;
const KERNEL_RING1 = 0.5;
const KERNEL_RING2 = 0.2;

type DotCell = {
  lng: number;
  lat: number;
  row: number;
  col: number;
  photoCount: number;
  totalScore: number;
  densityLevel: number;
};

export function buildLandDotGrid(
  map: MapboxMap,
  photos: Photo[],
  countryId: CountryId,
): FeatureCollection<Point, LandDotProps> {
  const bounds = countryId === "kr" ? KOREA_GRID_BOUNDS : COUNTRY_BY_ID[countryId].bounds;
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const step = Math.max(latSpan, lngSpan) / GRID_CELLS;
  const originLat = bounds.minLat + step / 2;
  const originLng = bounds.minLng + step / 2;
  const water = queryWaterPolygons(map);

  const cells: DotCell[] = [];
  const byGrid = new Map<string, DotCell>();

  const pushCell = (lng: number, lat: number) => {
    const col = Math.round((lng - originLng) / step);
    const row = Math.round((lat - originLat) / step);
    const key = `${row}:${col}`;
    if (byGrid.has(key)) return;
    const cell: DotCell = {
      lng,
      lat,
      row,
      col,
      photoCount: 0,
      totalScore: 0,
      densityLevel: 0,
    };
    cells.push(cell);
    byGrid.set(key, cell);
  };

  for (let lat = originLat; lat < bounds.maxLat; lat += step) {
    for (let lng = originLng; lng < bounds.maxLng; lng += step) {
      if (countryId === "kr" && !isInKoreaTerritory(lng, lat)) continue;
      if (isInWater(lng, lat, water)) continue;
      pushCell(lng, lat);
    }
  }

  if (countryId === "kr") {
    for (const seed of KOREA_ISLAND_SEEDS) {
      pushCell(seed.lng, seed.lat);
    }
  }

  spreadPhotoKernels(cells, byGrid, photos);
  assignDensityLevels(cells);

  return {
    type: "FeatureCollection",
    features: cells.map((cell, index) => ({
      type: "Feature",
      id: index,
      properties: {
        photoCount: cell.photoCount,
        totalScore: cell.totalScore,
        densityLevel: cell.densityLevel,
        count: cell.totalScore,
      },
      geometry: { type: "Point", coordinates: [cell.lng, cell.lat] },
    })),
  };
}

function spreadPhotoKernels(cells: DotCell[], byGrid: Map<string, DotCell>, photos: Photo[]) {
  if (cells.length === 0) return;

  for (const photo of photos) {
    let best = cells[0]!;
    let bestDist = Infinity;
    for (const cell of cells) {
      const dist = approxDistance(cell, photo);
      if (dist < bestDist) {
        bestDist = dist;
        best = cell;
      }
    }

    best.photoCount += 1;

    for (let dr = -2; dr <= 2; dr += 1) {
      for (let dc = -2; dc <= 2; dc += 1) {
        const ring = Math.max(Math.abs(dr), Math.abs(dc));
        const weight = ring === 0 ? KERNEL_CENTER : ring === 1 ? KERNEL_RING1 : KERNEL_RING2;
        const neighbor = byGrid.get(`${best.row + dr}:${best.col + dc}`);
        if (!neighbor) continue;
        neighbor.totalScore += weight;
      }
    }
  }
}

/** totalScore > 0 인 도트만 상위 20% 단위 5분위. 1이 가장 짙음. */
function assignDensityLevels(cells: DotCell[]) {
  const occupied = cells.filter((cell) => cell.totalScore > 0);
  occupied.sort((a, b) => b.totalScore - a.totalScore || a.lat - b.lat);
  const n = occupied.length;
  occupied.forEach((cell, index) => {
    const bucket = n <= 1 ? 0 : Math.min(4, Math.floor((index / n) * 5));
    cell.densityLevel = bucket + 1;
  });
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
