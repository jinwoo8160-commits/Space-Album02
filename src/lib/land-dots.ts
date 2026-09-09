import { COUNTRY_BY_ID } from "@/data/country-masks";
import {
  isInKoreaTerritory,
  KOREA_GRID_BOUNDS,
  KOREA_ISLAND_SEEDS,
} from "@/data/korea-territory";
import { hexForFilterKey, UNCLASSIFIED_HEX } from "@/lib/constants";
import { approxDistance } from "@/lib/geo";
import { MAPBOX_STREETS_SOURCE, WATER_QUERY_LAYER } from "@/lib/map-style";
import type { CategoryFilterKey, CountryId, Photo } from "@/types/album";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { ExpressionSpecification, Map as MapboxMap } from "mapbox-gl";

/**
 * 국가는 bounding box 로 훑되, 한국은 한반도 영토 폴리곤 안에만 점을 남깁니다.
 * 사진→가장 가까운 도트에 유클리드 가우시안 커널로 점수를 퍼뜨리고, 밀도 4단계는 격자 생성 시 1회만 계산합니다.
 * 카테고리 핀이 켜져 있으면 도트 색은 키컬러(또는 가중치 RGB 혼합)입니다.
 */
export const DOT_RADIUS_PX = 1.85;
const GRID_CELLS = 130;
/**
 * 유클리드 원판 반지름(격자 칸). 2.5~3칸은 점 격자에 다이아몬드로 찍혀
 * 각져 보이므로, 모서리가 둥근 원형으로 읽히도록 4.5칸을 씁니다.
 */
const KERNEL_RADIUS_CELLS = 4.5;
/** W(R) ≈ 0.135 가 되도록 σ = R/√2. 원판 안쪽이 더 고르게 짙어져 원형으로 읽힙니다. */
const KERNEL_SIGMA = KERNEL_RADIUS_CELLS / Math.SQRT2;

export type LandDotProps = {
  photoCount: number;
  totalScore: number;
  densityLevel: number;
  count: number;
  color: string;
  blendedColor: string;
};

export const DENSITY_OPACITY_EXPR: ExpressionSpecification = [
  "match",
  ["get", "densityLevel"],
  1,
  1.0,
  2,
  0.75,
  3,
  0.5,
  4,
  0.25,
  0.1,
];

export const DOT_COLOR_EXPR: ExpressionSpecification = [
  "to-color",
  ["coalesce", ["get", "color"], UNCLASSIFIED_HEX],
];

type DotCell = {
  lng: number;
  lat: number;
  row: number;
  col: number;
  photoCount: number;
  totalScore: number;
  densityLevel: number;
  scoreByCategory: Map<string, number>;
  color: string;
};

export function buildLandDotGrid(
  map: MapboxMap,
  photos: Photo[],
  countryId: CountryId,
  colorize = false,
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
      scoreByCategory: new Map(),
      color: UNCLASSIFIED_HEX,
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
  assignDotColors(cells, colorize);

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
        color: cell.color,
        blendedColor: cell.color,
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
    const categoryKey = photo.category ?? "unclassified";

    const reach = Math.ceil(KERNEL_RADIUS_CELLS);
    for (let dr = -reach; dr <= reach; dr += 1) {
      for (let dc = -reach; dc <= reach; dc += 1) {
        const d = Math.hypot(dr, dc);
        if (d > KERNEL_RADIUS_CELLS) continue;
        const neighbor = byGrid.get(`${best.row + dr}:${best.col + dc}`);
        if (!neighbor) continue;
        const t = d / KERNEL_SIGMA;
        const weight = Math.exp(-(t * t));
        neighbor.totalScore += weight;
        neighbor.scoreByCategory.set(categoryKey, (neighbor.scoreByCategory.get(categoryKey) ?? 0) + weight);
      }
    }
  }
}

/** totalScore > 0 인 도트만 상위 25% 단위 4분위. 1이 가장 짙음. */
function assignDensityLevels(cells: DotCell[]) {
  const occupied = cells.filter((cell) => cell.totalScore > 0);
  occupied.sort((a, b) => b.totalScore - a.totalScore || a.lat - b.lat);
  const n = occupied.length;
  occupied.forEach((cell, index) => {
    const bucket = n <= 1 ? 0 : Math.min(3, Math.floor((index / n) * 4));
    cell.densityLevel = bucket + 1;
  });
}

function assignDotColors(cells: DotCell[], colorize: boolean) {
  for (const cell of cells) {
    if (!colorize || cell.totalScore <= 0) {
      cell.color = UNCLASSIFIED_HEX;
      continue;
    }
    cell.color = blendCategoryColors(cell.scoreByCategory);
  }
}

function blendCategoryColors(scores: Map<string, number>): string {
  let r = 0;
  let g = 0;
  let b = 0;
  let weight = 0;
  scores.forEach((score, key) => {
    if (score <= 0) return;
        const [cr, cg, cb] = parseHex(hexForFilterKey(key as CategoryFilterKey));
    r += cr * score;
    g += cg * score;
    b += cb * score;
    weight += score;
  });
  if (weight <= 0) return UNCLASSIFIED_HEX;
  return rgbToHex(r / weight, g / weight, b / weight);
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [Number.parseInt(h.slice(0, 2), 16), Number.parseInt(h.slice(2, 4), 16), Number.parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
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
