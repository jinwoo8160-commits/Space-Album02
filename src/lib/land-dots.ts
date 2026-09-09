import { WATER_QUERY_LAYER } from "@/lib/map-style";
import type { Photo } from "@/types/album";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { Map as MapboxMap } from "mapbox-gl";

/**
 * 화면을 일정 픽셀 간격으로 훑고, 지금 뷰포트에 그려진 Mapbox 수역 픽셀은 버립니다.
 * 남은 칸 = 육지 도트. 해안선은 streets 타일의 water 폴리곤에서 나옵니다.
 *
 * 점 크기는 고정입니다. 사진이 가까운 칸만 count 가 올라 검게 보입니다.
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치 — SPACING_PX, 기본 회색
 */
export const DOT_SPACING_PX = 6;
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

  const photoScreens = photos.map((photo) => {
    const point = map.project([photo.lng, photo.lat]);
    return { x: point.x, y: point.y };
  });
  const influenceSq = PHOTO_INFLUENCE_PX * PHOTO_INFLUENCE_PX;
  const query = { layers: [WATER_QUERY_LAYER] };

  const features: Feature<Point, LandDotProps>[] = [];
  let index = 0;

  for (let y = DOT_SPACING_PX / 2; y < height; y += DOT_SPACING_PX) {
    for (let x = DOT_SPACING_PX / 2; x < width; x += DOT_SPACING_PX) {
      if (map.queryRenderedFeatures([x, y], query).length > 0) continue;

      const lngLat = map.unproject([x, y]);
      const lng = lngLat.lng;
      const lat = lngLat.lat;
      if (lng < -180 || lng > 180 || lat < -85 || lat > 85) continue;

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
