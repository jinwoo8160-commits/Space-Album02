import { clusterCellSize } from "@/lib/zoom";
import { NEIGHBORHOOD_COORD_PRECISION } from "@/lib/constants";
import type { OverlayMode, Photo, PhotoCluster } from "@/types/album";

/**
 * 줌 6~11 은 "근처끼리 묶음", 12+ 는 "같은 좌표만 묶음".
 *
 * 왜 MapLibre 내장 cluster 를 안 쓰나요?
 * 내장 클러스터는 숫자 뱃지 원만 그릴 수 있습니다.
 * 스케치의 폴라로이드 스택은 HTML 마커가 필요해서, 묶는 계산만 JS 로 하고
 * 그리기는 Marker 컴포넌트에 맡깁니다.
 */
export function clusterPhotos(photos: Photo[], mode: OverlayMode, zoom: number): PhotoCluster[] {
  if (mode === "dots") return [];

  const groups = new Map<string, Photo[]>();
  const cell = clusterCellSize(zoom);

  photos.forEach((photo) => {
    const key =
      mode === "pins"
        ? `${photo.lat.toFixed(NEIGHBORHOOD_COORD_PRECISION)}_${photo.lng.toFixed(NEIGHBORHOOD_COORD_PRECISION)}`
        : `${Math.round(photo.lat / cell)}_${Math.round(photo.lng / cell)}`;

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
