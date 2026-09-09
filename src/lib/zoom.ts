import type { OverlayMode } from "@/types/album";

/**
 * Mapbox GL 줌 숫자 ↔ 레이어.
 *
 * 휠/핀치가 만드는 연속 줌(1.3, 5.42, 11.87 …)을 그대로 씁니다.
 * 레이어만 구간별로 페이드인/아웃 하고, 줌 자체를 5단계로 끊지 않습니다.
 *
 *  | 줌            | 의미           | 레이어
 *  | 0 ~ 5         | 국가 / 대륙    | 미세 Circle 도트 (크기 고정, opacity = 밀도)
 *  | 6 ~ 11        | 시·도 / 구·군 | 도트 디졸브 아웃 + 묶음 핀 디졸브 인
 *  | 12 이상       | 동 / 거리      | 개별 사진 핀
 */
export const DOT_FADE_START = 5.2;
export const DOT_FADE_END = 6.4;
export const CLUSTER_FADE_IN_START = 5.5;
export const CLUSTER_FADE_IN_END = 6.6;
export const CLUSTER_FADE_OUT_START = 11.0;
export const CLUSTER_FADE_OUT_END = 12.05;
export const PIN_FADE_IN_START = 11.15;
export const PIN_FADE_IN_END = 12.2;

export const DOT_MAX_ZOOM = 6;
export const CLUSTER_MAX_ZOOM = 12;

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

export function clusterCellSize(zoom: number) {
  const t = Math.min(1, Math.max(0, (zoom - DOT_MAX_ZOOM) / (CLUSTER_MAX_ZOOM - DOT_MAX_ZOOM)));
  return 0.11 * (1 - t) + 0.018 * t;
}

export const PIN_ZOOM = 12.6;
export const CLUSTER_ZOOM = 7.4;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function fadeIn(zoom: number, from: number, to: number) {
  if (to <= from) return zoom >= to ? 1 : 0;
  return clamp01((zoom - from) / (to - from));
}

function fadeOut(zoom: number, from: number, to: number) {
  return 1 - fadeIn(zoom, from, to);
}

/** 묶음 핀: 줌 6 근처에서 나타나고 12 근처에서 사라집니다. */
export function clusterLayerOpacity(zoom: number) {
  return fadeIn(zoom, CLUSTER_FADE_IN_START, CLUSTER_FADE_IN_END) * fadeOut(zoom, CLUSTER_FADE_OUT_START, CLUSTER_FADE_OUT_END);
}

/** 개별 핀: 줌 12 근처에서 나타납니다. */
export function pinLayerOpacity(zoom: number) {
  return fadeIn(zoom, PIN_FADE_IN_START, PIN_FADE_IN_END);
}
