import type { OverlayMode } from "@/types/album";

/**
 * 줌 자체는 Mapbox 휠/핀치 연속 줌입니다.
 * 레이어 전환은 매 프레임이 아니라 임계점을 넘고 조작이 끝났을 때 1회만 합니다.
 *
 *  | 줌            | 레이어
 *  | 5.0 미만      | 육지 도트 격자
 *  | 5.0 ~ 12      | 도트 visibility none + 묶음 핀
 *  | 12 이상       | 개별 사진 핀
 */
export const DOT_ZOOM_THRESHOLD = 5;
export const CLUSTER_MAX_ZOOM = 12;
export const DOT_MAX_ZOOM = DOT_ZOOM_THRESHOLD;

export const DEFAULT_MAP_ZOOM = 4.55;

export function overlayModeFromZoom(zoom: number): OverlayMode {
  if (zoom < DOT_ZOOM_THRESHOLD) return "dots";
  if (zoom < CLUSTER_MAX_ZOOM) return "clusters";
  return "pins";
}

export const OVERLAY_LABEL: Record<OverlayMode, string> = {
  dots: "국가/대륙 · 미세 도트",
  clusters: "시·구 · 묶음 핀",
  pins: "동/거리 · 개별 핀",
};

export function clusterCellSize(zoom: number) {
  const t = Math.min(
    1,
    Math.max(0, (zoom - DOT_ZOOM_THRESHOLD) / (CLUSTER_MAX_ZOOM - DOT_ZOOM_THRESHOLD)),
  );
  return 0.11 * (1 - t) + 0.018 * t;
}

export const PIN_ZOOM = 12.6;
export const CLUSTER_ZOOM = 7.4;
export const COUNTRY_FIT_MAX_ZOOM = 4.7;
