import type { OverlayMode } from "@/types/album";

/**
 * 줌은 Mapbox 휠/핀치 연속 줌입니다.
 * 레이어 전환은 임계점(7.0, 9.5)을 넘고 조작이 끝났을 때 1회만 합니다.
 *
 *  | 줌            | 레이어
 *  | 0.0 ~ 7.0     | 배경 도트 격자 (밀도 = opacity)
 *  | 7.0 ~ 9.5     | 사진 좌표 Circle
 *  | 9.5 이상      | 위성/도로 + 묶음·개별 핀
 */
export const LAND_DOTS_MAX_ZOOM = 7;
export const PHOTO_DOTS_MAX_ZOOM = 9.5;
export const CLUSTER_MAX_ZOOM = 12;

export const DOT_ZOOM_THRESHOLD = LAND_DOTS_MAX_ZOOM;
export const DOT_MAX_ZOOM = LAND_DOTS_MAX_ZOOM;

export const DEFAULT_MAP_ZOOM = 5.4;

export type MapStage = "land-dots" | "photo-dots" | "detail";

export function mapStageFromZoom(zoom: number): MapStage {
  if (zoom < LAND_DOTS_MAX_ZOOM) return "land-dots";
  if (zoom < PHOTO_DOTS_MAX_ZOOM) return "photo-dots";
  return "detail";
}

export function overlayModeFromZoom(zoom: number): OverlayMode {
  if (zoom < LAND_DOTS_MAX_ZOOM) return "dots";
  if (zoom < PHOTO_DOTS_MAX_ZOOM) return "dataDots";
  if (zoom < CLUSTER_MAX_ZOOM) return "clusters";
  return "pins";
}

export const OVERLAY_LABEL: Record<OverlayMode, string> = {
  dots: "국가/대륙 · 배경 도트",
  dataDots: "시·구 · 사진 도트",
  clusters: "동/거리 · 위성 + 묶음",
  pins: "동/거리 · 위성 + 핀",
};

export function clusterCellSize(zoom: number) {
  const t = Math.min(
    1,
    Math.max(0, (zoom - PHOTO_DOTS_MAX_ZOOM) / (CLUSTER_MAX_ZOOM - PHOTO_DOTS_MAX_ZOOM)),
  );
  return 0.08 * (1 - t) + 0.016 * t;
}

/** 시·구 도트 단계로 들어갑니다. */
export const DATA_DOTS_ZOOM = 8.15;
/** 위성 + 묶음 핀이 보이는 상세 단계. */
export const DETAIL_ZOOM = 10.35;
export const PIN_ZOOM = 12.6;
export const CLUSTER_ZOOM = DATA_DOTS_ZOOM;
export const COUNTRY_FIT_MAX_ZOOM = 5.8;
