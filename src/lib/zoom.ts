import type { OverlayMode } from "@/types/album";

/**
 * Mapbox GL / MapLibre 줌 숫자와 레이어를 연결하는 기준표.
 *
 * 왜 이름(country/city) 대신 실제 줌 숫자를 쓰나요?
 * 지도 엔진이 이미 0~22 줌을 가지고 있습니다.
 * 우리끼리 0,1,2,3 단계를 따로 두면 "지금 지도 줌이 7인데 우리 상태는 city"처럼
 * 두 값이 어긋날 수 있습니다. 엔진 줌을 단일 기준으로 두면 레이어 전환이 자동입니다.
 *
 *  | 줌            | 의미              | 레이어
 *  | 0 ~ 5         | 국가 / 대륙       | 미세 Circle 도트 (명암 = 밀도)
 *  | 6 ~ 11        | 시·도 / 구·군    | 도트 숨김 + 사진 묶음 핀
 *  | 12 이상       | 동 / 거리         | 개별 사진 핀
 */
export const DOT_MAX_ZOOM = 6;
export const CLUSTER_MAX_ZOOM = 12;
export const STREET_MIN_ZOOM = 12;

export const DEFAULT_MAP_ZOOM = 5.2;

export function overlayModeFromZoom(zoom: number): OverlayMode {
  if (zoom < DOT_MAX_ZOOM) return "dots";
  if (zoom < CLUSTER_MAX_ZOOM) return "clusters";
  return "pins";
}

export const OVERLAY_LABEL: Record<OverlayMode, string> = {
  dots: "국가/대륙 · 미세 도트",
  clusters: "시·구 · 묶음 핀",
  pins: "동/거리 · 개별 핀",
};

/** 시·구 묶음 격자는 줌이 올라갈수록 칸이 작아집니다 (더 쪼개져 보임). */
export function clusterCellSize(zoom: number) {
  const t = Math.min(1, Math.max(0, (zoom - DOT_MAX_ZOOM) / (CLUSTER_MAX_ZOOM - DOT_MAX_ZOOM)));
  return 0.11 * (1 - t) + 0.018 * t;
}

export const PIN_ZOOM = 12.6;
export const CLUSTER_ZOOM = 7.4;
