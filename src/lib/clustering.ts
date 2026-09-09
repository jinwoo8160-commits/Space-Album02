import {
  CITY_CLUSTER_CELL,
  NEIGHBORHOOD_COORD_PRECISION,
} from "@/lib/constants";
import type { Photo, PhotoCluster, ZoomLevel } from "@/types/album";

/**
 * 줌 단계에 따라 "묶는 단위"가 달라집니다.
 *
 * city        : 근처 좌표를 격자(그리드)로 묶어 스택+숫자 배지
 * neighborhood: 완전히 같은 좌표만 묶음 (요구사항: 동일 좌표만)
 *
 * 왜 격자인가?
 * 클러스터링 알고리즘(DBSCAN 등)은 강력하지만 학습용 1차 구현에는 무겁습니다.
 * lat/lng 를 칸 크기로 나눈 정수 키가 있으면, 같은 키 = 같은 묶음이 됩니다.
 */
export function clusterPhotos(photos: Photo[], zoomLevel: ZoomLevel): PhotoCluster[] {
  const groups = new Map<string, Photo[]>();

  photos.forEach((photo) => {
    const key =
      zoomLevel === "neighborhood"
        ? `${photo.lat.toFixed(NEIGHBORHOOD_COORD_PRECISION)}_${photo.lng.toFixed(NEIGHBORHOOD_COORD_PRECISION)}`
        : `${Math.round(photo.lat / CITY_CLUSTER_CELL)}_${Math.round(photo.lng / CITY_CLUSTER_CELL)}`;

    const list = groups.get(key);
    if (list) list.push(photo);
    else groups.set(key, [photo]);
  });

  return [...groups.entries()].map(([id, grouped]) => ({
    id,
    photos: grouped,
    lat: average(grouped.map((p) => p.lat)),
    lng: average(grouped.map((p) => p.lng)),
  }));
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
