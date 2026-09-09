import type { OverlayMode } from "@/types/album";

/**
 * 줌은 Mapbox 휠/핀치 연속 줌입니다.
 * Mapbox 레이어 전환은 줌 9.5를 넘고 조작이 끝났을 때 1회만 합니다.
 *
 *  | 줌            | 레이어
 *  | 5.4 ~ 9.5     | 육지 도트 격자 (고정 GeoJSON, 밀도 = opacity)
 *  | 9.5 ~ 12      | 도트 none + 흰 모노톤 도로/지형 + 묶음 핀
 *  | 12 이상       | 흰 모노톤 지도 + 개별 핀
 */
export const DOT_MAX_ZOOM = 9.5;
export const CLUSTER_MAX_ZOOM = 12;
export const DOT_ZOOM_THRESHOLD = DOT_MAX_ZOOM;

export const DEFAULT_MAP_ZOOM = 5.4;
export const MIN_MAP_ZOOM = 5.4;
/** 줌 5.4 에서 남한 영토가 화면 정중앙에 오도록 맞춘 좌표. */
export const KOREA_HOME_CENTER: [number, number] = [127.8, 35.8];
/** 이 줌 미만으로 들어가면 홈 좌표로 자석 보간을 시작합니다. */
export const SNAP_START_ZOOM = 6.0;
/**
 * 줌 5.4 에서 [127.8, 35.8]이 화면 정중앙에 올 수 있게 한반도 주변을 가둡니다.
 * 범위를 너무 좁히면 Mapbox 가 뷰포트(레티나 포함)에 맞춰 minZoom 을 5.4보다
 * 올려 버리므로, 2× 픽셀 밀도에서도 5.4가 나오도록 여유를 둡니다.
 * 실제 홈 고정은 자석 스냅·센터 락이 담당합니다.
 */
export const KOREA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [119.2, 26.0],
  [136.4, 44.8],
];

/** zoom 6→5.4 구간에서 홈으로 끌어당기는 세기. 5.4에서 1. */
export function koreaMagnetPull(zoom: number): number {
  if (zoom >= SNAP_START_ZOOM) return 0;
  if (zoom <= MIN_MAP_ZOOM) return 1;
  const t = (SNAP_START_ZOOM - zoom) / (SNAP_START_ZOOM - MIN_MAP_ZOOM);
  return t * t;
}

export function magnetCenterTowardKorea(lng: number, lat: number, zoom: number): [number, number] {
  const pull = koreaMagnetPull(zoom);
  if (pull <= 0) return [lng, lat];
  if (pull >= 1) return KOREA_HOME_CENTER;
  return [
    lng + (KOREA_HOME_CENTER[0] - lng) * pull,
    lat + (KOREA_HOME_CENTER[1] - lat) * pull,
  ];
}

export function isKoreaMinZoom(zoom: number): boolean {
  return zoom <= MIN_MAP_ZOOM + 0.04;
}

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
