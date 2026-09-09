import { CATEGORY_HEX, UNCLASSIFIED_HEX } from "@/lib/constants";
import type { CategoryColor, Photo } from "@/types/album";
import type { Feature, FeatureCollection, Point } from "geojson";

export type PhotoDotProps = {
  count: number;
  category: Exclude<CategoryColor, null> | "none";
};

/**
 * 시·구 줌용: 육지 격자가 아니라 실제 사진 좌표에 Circle 을 둡니다.
 * 같은 칸의 사진은 한 점으로 합치고 count 만 올립니다.
 */
export function photosToPhotoDotsGeoJSON(
  photos: Photo[],
): FeatureCollection<Point, PhotoDotProps> {
  const buckets = new Map<
    string,
    { lat: number; lng: number; count: number; category: PhotoDotProps["category"] }
  >();

  photos.forEach((photo) => {
    const key = `${photo.lat.toFixed(3)}_${photo.lng.toFixed(3)}`;
    const current = buckets.get(key);
    const category = photo.category ?? "none";
    if (current) {
      current.count += 1;
      current.lat += photo.lat;
      current.lng += photo.lng;
    } else {
      buckets.set(key, { lat: photo.lat, lng: photo.lng, count: 1, category });
    }
  });

  const features: Feature<Point, PhotoDotProps>[] = [...buckets.entries()].map(
    ([id, bucket]) => ({
      type: "Feature",
      id,
      properties: {
        count: bucket.count,
        category: bucket.category,
      },
      geometry: {
        type: "Point",
        coordinates: [bucket.lng / bucket.count, bucket.lat / bucket.count],
      },
    }),
  );

  return { type: "FeatureCollection", features };
}

export const PHOTO_DOT_COLOR_EXPR = [
  "match",
  ["get", "category"],
  "pink",
  CATEGORY_HEX.pink,
  "green",
  CATEGORY_HEX.green,
  "cyan",
  CATEGORY_HEX.cyan,
  "red",
  CATEGORY_HEX.red,
  UNCLASSIFIED_HEX,
] as const;
