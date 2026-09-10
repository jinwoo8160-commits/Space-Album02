import type { CategoryColor, CategoryFilterKey, KeyCategory } from "@/types/album";

export const BUILTIN_KEY_CATEGORIES: KeyCategory[] = [
  { id: "pink", name: "분홍", hex: "#FF4FA3" },
  { id: "green", name: "초록", hex: "#8CFF3A" },
  { id: "cyan", name: "시안", hex: "#22E6FF" },
  { id: "red", name: "빨강", hex: "#FF2B2B" },
];

export const CATEGORY_PRESET_HEX = [
  "#FF4FA3",
  "#8CFF3A",
  "#22E6FF",
  "#FF2B2B",
  "#FF8A00",
  "#FFE14A",
  "#7B61FF",
  "#FF6B6B",
  "#00C2A8",
  "#4D7CFE",
  "#C44569",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
  "#10AC84",
  "#EE5A24",
];

export const CATEGORY_HEX: Record<string, string> = Object.fromEntries(
  BUILTIN_KEY_CATEGORIES.map((item) => [item.id, item.hex]),
);

export const UNCLASSIFIED_HEX = "#111111";
export const UNCLASSIFIED_KEY = "unclassified";
export const DEFAULT_DOT_HEX = UNCLASSIFIED_HEX;

export function hexByCategoryList(categories: KeyCategory[]): Record<string, string> {
  return Object.fromEntries(categories.map((item) => [item.id, item.hex]));
}

export function hexForCategory(category: CategoryColor, hexById: Record<string, string> = CATEGORY_HEX): string {
  if (!category) return UNCLASSIFIED_HEX;
  return hexById[category] ?? CATEGORY_HEX[category] ?? UNCLASSIFIED_HEX;
}

export function hexForFilterKey(key: CategoryFilterKey, hexById: Record<string, string> = CATEGORY_HEX): string {
  if (key === UNCLASSIFIED_KEY) return UNCLASSIFIED_HEX;
  return hexById[key] ?? CATEGORY_HEX[key] ?? UNCLASSIFIED_HEX;
}

export const CATEGORY_LABEL: Record<string, string> = {
  pink: "분홍",
  green: "초록",
  cyan: "파랑",
  red: "빨강",
};

/** 키컬러로 쓰지 않는 검정·거의 검정. 기본 도트 색과 구분합니다. */
export function isBlackKeyColor(hex: string): boolean {
  const raw = hex.replace("#", "").trim();
  const h = raw.length === 3 ? raw.split("").map((ch) => ch + ch).join("") : raw;
  if (h.length < 6) return true;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return true;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 48;
}

export function dropBlackKeyCategories(categories: KeyCategory[]): KeyCategory[] {
  return categories.filter((item) => !isBlackKeyColor(item.hex) && item.id !== UNCLASSIFIED_KEY);
}

export function fallbackBlackPhotoCategory(
  category: CategoryColor,
  hexById: Record<string, string> = CATEGORY_HEX,
): CategoryColor {
  if (!category || category === UNCLASSIFIED_KEY) return null;
  const hex = hexById[category] ?? CATEGORY_HEX[category];
  if (hex && isBlackKeyColor(hex)) return null;
  return category;
}
