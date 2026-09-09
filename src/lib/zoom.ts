import {
  CITY_FOCUS_SPAN,
  NEIGHBORHOOD_FOCUS_SPAN,
  ZOOM_ORDER,
} from "@/lib/constants";
import type { MapFocus, Photo, ZoomLevel } from "@/types/album";

export function zoomIndex(level: ZoomLevel) {
  return ZOOM_ORDER.indexOf(level);
}

export function nextZoom(level: ZoomLevel): ZoomLevel {
  return ZOOM_ORDER[Math.min(zoomIndex(level) + 1, ZOOM_ORDER.length - 1)]!;
}

export function prevZoom(level: ZoomLevel): ZoomLevel {
  return ZOOM_ORDER[Math.max(zoomIndex(level) - 1, 0)]!;
}

/**
 * 다음 단계로 들어갈 때 화면 중심을 어디로 둘지 정합니다.
 *
 * 국가 → 시/도 : 나라 전체를 그대로 보되 점 간격만 바꿉니다 (focus 없음).
 * 시/도 → 구/시 : 클릭한 점 근처를 도시 지도 초점으로.
 * 구/시 → 동    : 클러스터 중심으로 더 깊게.
 */
export function focusForZoom(level: ZoomLevel, lat: number, lng: number): MapFocus | null {
  if (level === "city") return { lat, lng, span: CITY_FOCUS_SPAN };
  if (level === "neighborhood") return { lat, lng, span: NEIGHBORHOOD_FOCUS_SPAN };
  return null;
}

export function defaultFocusFromPhotos(photos: Photo[]): MapFocus | null {
  if (photos.length === 0) return null;
  return {
    lat: photos.reduce((sum, photo) => sum + photo.lat, 0) / photos.length,
    lng: photos.reduce((sum, photo) => sum + photo.lng, 0) / photos.length,
    span: CITY_FOCUS_SPAN,
  };
}
