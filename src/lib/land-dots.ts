import { MAPBOX_STREETS_SOURCE, WATER_QUERY_LAYER } from "@/lib/map-style";
import type { Photo } from "@/types/album";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { Map as MapboxMap } from "mapbox-gl";

/**
 * 화면 격자를 한 번만 만들고, 수역 폴리곤은 뷰포트에서 한 번만 가져옵니다.
 * (픽셀마다 queryRenderedFeatures 를 부르면 줌 중 WebGL 컨텍스트가 죽습니다.)
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치 — SPACING_PX, 기본 회색
 */
export const DOT_SPACING_PX = 7;
export const DOT_RADIUS_PX = 1.85;
export const PHOTO_INFLUENCE_PX = 44;

export type LandDotProps = { count: number };

export function buildLandDotGrid(
  map: MapboxMap,
  photos: Photo[],
): FeatureCollection<Point, LandDotProps> {
  const canvas = map.getCanvas();
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const water = queryWaterPolygons(map, width, height);

  const photoScreens = photos.map((photo) => {
    const point = map.project([photo.lng, photo.lat]);
    return { x: point.x, y: point.y };
  });
  const influenceSq = PHOTO_INFLUENCE_PX * PHOTO_INFLUENCE_PX;

  const features: Feature<Point, LandDotProps>[] = [];
  let index = 0;

  for (let y = DOT_SPACING_PX / 2; y < height; y += DOT_SPACING_PX) {
    for (let x = DOT_SPACING_PX / 2; x < width; x += DOT_SPACING_PX) {
      const lngLat = map.unproject([x, y]);
      const lng = lngLat.lng;
      const lat = lngLat.lat;
      if (lng < -180 || lng > 180 || lat < -85 || lat > 85) continue;
      if (isInWater(lng, lat, water)) continue;

      let count = 0;
      for (const photo of photoScreens) {
        const dx = photo.x - x;
        const dy = photo.y - y;
        if (dx * dx + dy * dy <= influenceSq) count += 1;
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

function queryWaterPolygons(map: MapboxMap, width: number, height: number): GeoJSON.Feature[] {
  try {
    const rendered = map.queryRenderedFeatures(
      [
        [0, 0],
        [width, height],
      ],
      { layers: [WATER_QUERY_LAYER] },
    );
    if (rendered.length > 0) return rendered;
  } catch {
    // 레이어가 아직 없으면 소스에서 가져옵니다.
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
