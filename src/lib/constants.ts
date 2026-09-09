import type { CategoryFilterKey, ZoomLevel } from "@/types/album";

/**
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * 스케치의 분홍/라임/시안/빨강 원형 핀 색상을 여기서 한 번에 바꿉니다.
 * 컴포넌트마다 hex 를 흩뿌리지 않는 이유: 필터 핀, 도트, 사진 테두리가 항상 같아야 합니다.
 */
export const CATEGORY_HEX: Record<Exclude<CategoryFilterKey, "unclassified">, string> = {
  pink: "#FF4FA3",
  green: "#8CFF3A",
  cyan: "#22E6FF",
  red: "#FF2B2B",
};

export const UNCLASSIFIED_HEX = "#111111";

export const CATEGORY_LABEL: Record<CategoryFilterKey, string> = {
  pink: "분홍",
  green: "초록",
  cyan: "파랑",
  red: "빨강",
  unclassified: "미분류",
};

export const ZOOM_ORDER: ZoomLevel[] = [
  "country",
  "province",
  "city",
  "neighborhood",
];

export const ZOOM_LABEL: Record<ZoomLevel, string> = {
  country: "국가 수준",
  province: "시/도 수준",
  city: "구/시 수준",
  neighborhood: "동/군/구 수준",
};

/** 도시 수준 클러스터 격자 크기(도). 약 2~3km 단위로 묶습니다. */
export const CITY_CLUSTER_CELL = 0.03;

/** 동 수준에서 "같은 좌표"로 볼 반올림 자릿수. */
export const NEIGHBORHOOD_COORD_PRECISION = 5;

export const CITY_FOCUS_SPAN = 0.22;
export const NEIGHBORHOOD_FOCUS_SPAN = 0.055;

/** 활성 탭 아이콘 색 — 스케치의 노란 골드 */
export const TAB_ACTIVE = "#E6C84A";
