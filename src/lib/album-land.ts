import {
  isInKoreaTerritory,
  KOREA_GRID_BOUNDS,
  KOREA_ISLAND_SEEDS,
} from "@/data/korea-territory";
import { DOT_RADIUS_PX } from "@/lib/land-dots";
import type { FeatureCollection, Point } from "geojson";

/**
 * 메인 지도는 폰 프레임(~844px) 안에서 거의 전체 높이를 씁니다.
 * 앨범 미니맵은 높이 200px 이라 같은 지리적 피치면 윤곽이 끊깁니다.
 */
export const MAIN_MAP_REF_PX = 640;
export const ALBUM_MINI_MAP_PX = 200;
export const ALBUM_TO_MAIN_SCALE = ALBUM_MINI_MAP_PX / MAIN_MAP_REF_PX;

const MAIN_GRID_CELLS = 130;

/**
 * 축소 비율만큼 격자 칸을 늘리고, 반지름은 비율대로 줄이되
 * 1px 미만이면 래스터에서 점이 사라져 성기게 보이므로 바닥을 둡니다.
 * 작은 캔버스에서는 채움 비율을 조금 더 높여 한반도 윤곽이 이어지게 합니다.
 */
export const ALBUM_LAND_CELLS = Math.round(MAIN_GRID_CELLS / ALBUM_TO_MAIN_SCALE);
export const ALBUM_LAND_RADIUS = Math.max(
  1.15,
  Number((DOT_RADIUS_PX * ALBUM_TO_MAIN_SCALE).toFixed(2)),
);

export function buildKoreaAlbumLandDots(): FeatureCollection<Point> {
  const bounds = KOREA_GRID_BOUNDS;
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const step = Math.max(latSpan, lngSpan) / ALBUM_LAND_CELLS;
  const originLat = bounds.minLat + step / 2;
  const originLng = bounds.minLng + step / 2;
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
      if (!isInKoreaTerritory(lng, lat)) continue;
      push(lng, lat);
    }
  }
  for (const seed of KOREA_ISLAND_SEEDS) push(seed.lng, seed.lat);

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

export const KOREA_ALBUM_LAND_DOTS = buildKoreaAlbumLandDots();
