import { COUNTRIES } from "@/data/country-masks";
import { approxDistance } from "@/lib/geo";
import type { CountryId, GeoBounds, Photo } from "@/types/album";
import type { Feature, FeatureCollection, Point } from "geojson";

/**
 * 국가 줌용 미세 도트.
 * 사진마다 작은 육각 격자 점을 뿌려 서울·부산처럼 밀집한 곳이
 * 2~4px 점의 성운처럼 보이게 합니다. 점 크기는 고정, 진하기만 count.
 */
const STEP = 0.035;
const RING = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0.5, 0.86],
  [-0.5, 0.86],
  [0.5, -0.86],
  [-0.5, -0.86],
  [2, 0],
  [-2, 0],
  [1, 1.72],
  [-1, 1.72],
];

export type DensityProperties = {
  id: string;
  count: number;
};

export function photosToDensityGeoJSON(photos: Photo[]): FeatureCollection<Point, DensityProperties> {
  const buckets = new Map<string, { lat: number; lng: number; count: number }>();

  photos.forEach((photo) => {
    RING.forEach(([dx, dy]) => {
      const lat = photo.lat + dy * STEP;
      const lng = photo.lng + dx * STEP;
      const col = Math.round(lng / (STEP * 0.5));
      const row = Math.round(lat / (STEP * 0.5));
      const key = `${row}:${col}`;
      const dist = Math.hypot(dx, dy);
      const weight = dist < 0.2 ? 2 : 1;
      const current = buckets.get(key);
      if (current) current.count += weight;
      else buckets.set(key, { lat, lng, count: weight });
    });
  });

  const features: Feature<Point, DensityProperties>[] = [...buckets.entries()].map(
    ([id, bucket]) => ({
      type: "Feature",
      id,
      properties: {
        id,
        count: Math.min(8, bucket.count + nearbyPhotoBonus(bucket, photos)),
      },
      geometry: {
        type: "Point",
        coordinates: [bucket.lng, bucket.lat],
      },
    }),
  );

  return { type: "FeatureCollection", features };
}

function nearbyPhotoBonus(bucket: { lat: number; lng: number }, photos: Photo[]) {
  return photos.filter((photo) => approxDistance(bucket, photo) < 0.12).length;
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
