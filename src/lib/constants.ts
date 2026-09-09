import type { CategoryFilterKey } from "@/types/album";

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

/** 동 수준에서 "같은 좌표"로 볼 반올림 자릿수. */
export const NEIGHBORHOOD_COORD_PRECISION = 5;

/** 활성 탭 아이콘 색 — 스케치의 노란 골드 */
export const TAB_ACTIVE = "#E6C84A";
