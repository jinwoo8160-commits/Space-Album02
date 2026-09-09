import { clusterCellSize, CLUSTER_MAX_ZOOM } from "@/lib/zoom";
import { NEIGHBORHOOD_COORD_PRECISION } from "@/lib/constants";
import type { Photo, PhotoCluster } from "@/types/album";

/**
 * 줌 9.5~12 는 근처끼리 묶음, 12+ 는 같은 좌표만.
 * HTML 폴라로이드 스택을 그려야 해서 Mapbox 내장 cluster(숫자 원)는 쓰지 않습니다.
 */
export function clusterPhotos(
  photos: Photo[],
  mode: "clusters" | "pins",
  zoom: number,
): PhotoCluster[] {
  const groups = new Map<string, Photo[]>();
  const cell = clusterCellSize(Math.max(zoom, CLUSTER_MAX_ZOOM - 2));

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
