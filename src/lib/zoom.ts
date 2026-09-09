import type { OverlayMode } from "@/types/album";

/**
 * 줌은 Mapbox 휠/핀치 연속 줌입니다.
 * Mapbox 레이어 전환은 줌 9.5를 넘고 조작이 끝났을 때 1회만 합니다.
 *
 *  | 줌            | 레이어
 *  | 0.0 ~ 9.5     | 육지 도트 격자 (고정 GeoJSON, 밀도 = opacity)
 *  | 9.5 ~ 12      | 도트 none + 흰 모노톤 도로/지형 + 묶음 핀
 *  | 12 이상       | 흰 모노톤 지도 + 개별 핀
 */
export const DOT_MAX_ZOOM = 9.5;
export const CLUSTER_MAX_ZOOM = 12;
export const DOT_ZOOM_THRESHOLD = DOT_MAX_ZOOM;

export const DEFAULT_MAP_ZOOM = 5.4;
export const MIN_MAP_ZOOM = 5.4;
/** 줌 5.4 에서 남한 영토가 화면 중앙에 오도록 맞춘 좌표. */
export const KOREA_HOME_CENTER: [number, number] = [127.8, 35.8];
export const SNAP_START_ZOOM = 6.0;
export const KOREA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [122.4, 30.1],
  [133.2, 41.5],
];

export type MapStage = "dots" | "detail";

export function mapStageFromZoom(zoom: number): MapStage {
  return zoom < DOT_MAX_ZOOM ? "dots" : "detail";
}

export function overlayModeFromZoom(zoom: number): OverlayMode {
  if (zoom < DOT_MAX_ZOOM) return "dots";
  if (zoom < CLUSTER_MAX_ZOOM) return "clusters";
  return "pins";
}

export const OVERLAY_LABEL: Record<OverlayMode, string> = {
  dots: "국가~구 · 도트 지도",
  clusters: "동/거리 · 모노톤 + 묶음",
  pins: "동/거리 · 모노톤 + 핀",
};

export function clusterCellSize(zoom: number) {
  const t = Math.min(1, Math.max(0, (zoom - DOT_MAX_ZOOM) / (CLUSTER_MAX_ZOOM - DOT_MAX_ZOOM)));
  return 0.08 * (1 - t) + 0.016 * t;
}

export const DETAIL_ZOOM = 10.35;
export const PIN_ZOOM = 12.6;
export const CLUSTER_ZOOM = DETAIL_ZOOM;
export const COUNTRY_FIT_MAX_ZOOM = 6.2;
