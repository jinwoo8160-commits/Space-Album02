import {
  isInKoreaTerritory,
  KOREA_GRID_BOUNDS,
  KOREA_ISLAND_SEEDS,
} from "@/data/korea-territory";
import { DOT_RADIUS_PX } from "@/lib/land-dots";
import type { FeatureCollection, Point } from "geojson";

/** 메인 지도(폰 프레임 너비) 대비 앨범 미니맵 높이. */
export const MAIN_MAP_REF_PX = 390;
export const ALBUM_MINI_MAP_PX = 200;
export const ALBUM_TO_MAIN_SCALE = ALBUM_MINI_MAP_PX / MAIN_MAP_REF_PX;

const MAIN_GRID_CELLS = 130;

/**
 * 미니맵이 작아진 만큼 지리적 격자 간격을 줄여(셀 수를 늘려)
 * 픽셀 밀도가 메인 지도와 비슷하게 보이게 합니다.
 */
export const ALBUM_LAND_CELLS = Math.round(MAIN_GRID_CELLS / ALBUM_TO_MAIN_SCALE);
export const ALBUM_LAND_RADIUS = Number((DOT_RADIUS_PX * ALBUM_TO_MAIN_SCALE).toFixed(2));

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
