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
  "#2F3542",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
  "#10AC84",
  "#EE5A24",
  "#222F3E",
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
  unclassified: "미분류",
};
