import {
  isInKoreaTerritory,
  KOREA_GRID_BOUNDS,
  KOREA_ISLAND_SEEDS,
} from "@/data/korea-territory";
import type { FeatureCollection, Point } from "geojson";

/** 앨범 미니맵 전용. 국가 선택 미리보기보다 촘촘히 한반도 실루엣을 채웁니다. */
const ALBUM_LAND_CELLS = 54;

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
