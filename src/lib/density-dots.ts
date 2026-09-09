import { COUNTRIES } from "@/data/country-masks";
import type { CountryId, GeoBounds, Photo } from "@/types/album";
import type { Feature, FeatureCollection, Point } from "geojson";

/**
 * 국가/대륙 줌(0~5)에서 쓰는 미세 도트 GeoJSON.
 *
 * 왜 사진 한 장 = 원 하나가 아닌가요?
 * 같은 동네 사진을 그대로 찍으면 원이 겹쳐 하나의 큰 얼룩처럼 보입니다.
 * 작은 격자(hex에 가까운 그리드)로 묶으면 점 크기는 그대로 두고
 * count 만 올라가므로, 진하기(opacity)만 바꿔 밀도를 표현할 수 있습니다.
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * CELL_DEG / 원 반지름은 AlbumMap 의 Circle Layer paint 와 함께 조절하세요.
 */
const CELL_DEG = 0.055;

export type DensityProperties = {
  id: string;
  count: number;
};

export function photosToDensityGeoJSON(photos: Photo[]): FeatureCollection<Point, DensityProperties> {
  const buckets = new Map<string, { lat: number; lng: number; count: number }>();

  photos.forEach((photo) => {
    const col = Math.round(photo.lng / CELL_DEG);
    const row = Math.round(photo.lat / CELL_DEG);
    const key = `${row}:${col}`;
    const current = buckets.get(key);
    if (current) {
      current.count += 1;
      current.lat += photo.lat;
      current.lng += photo.lng;
    } else {
      buckets.set(key, { lat: photo.lat, lng: photo.lng, count: 1 });
    }
  });

  const features: Feature<Point, DensityProperties>[] = [...buckets.entries()].map(
    ([id, bucket]) => ({
      type: "Feature",
      id,
      properties: { id, count: bucket.count },
      geometry: {
        type: "Point",
        coordinates: [bucket.lng / bucket.count, bucket.lat / bucket.count],
      },
    }),
  );

  return { type: "FeatureCollection", features };
}

export function boundsToLngLat(bounds: GeoBounds): [[number, number], [number, number]] {
  return [
    [bounds.minLng, bounds.minLat],
    [bounds.maxLng, bounds.maxLat],
  ];
}

export function countryBounds(id: CountryId): [[number, number], [number, number]] {
  const country = COUNTRIES.find((item) => item.id === id)!;
  return boundsToLngLat(country.bounds);
}
