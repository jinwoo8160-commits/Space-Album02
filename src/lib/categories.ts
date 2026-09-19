import type { CategoryColor, CategoryFilterKey, KeyCategory } from "@/types/album";

export const BUILTIN_KEY_CATEGORIES: KeyCategory[] = [
  { id: "restaurant", name: "음식점", hex: "#E13E2B" },
  { id: "cafe", name: "카페", hex: "#FEE745" },
  { id: "scenery", name: "풍경", hex: "#7DA145" },
];

export const PLACE_CATEGORY_IDS = BUILTIN_KEY_CATEGORIES.map((item) => item.id);

export const CATEGORY_PRESET_HEX = [
  "#E13E2B",
  "#FEE745",
  "#7DA145",
  "#FF4FA3",
  "#22E6FF",
  "#FF8A00",
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

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  BUILTIN_KEY_CATEGORIES.map((item) => [item.id, item.name]),
);

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

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** 음식점 · 카페 · 풍경 중 하나를 시드 기반으로 고릅니다. */
export function pickRandomPlaceCategory(seed: string): string {
  return pickRandomCategoryId(PLACE_CATEGORY_IDS, seed);
}

export function pickRandomCategoryId(ids: string[], seed: string): string {
  if (ids.length === 0) return pickRandomPlaceCategory(seed);
  return ids[hashSeed(seed) % ids.length]!;
}

export function isPlaceCategoryId(id: string | null | undefined): boolean {
  return Boolean(id && PLACE_CATEGORY_IDS.includes(id));
}

/**
 * 삭제됐거나 더 이상 없는 카테고리는 음식점/카페/풍경 중 하나로 다시 붙입니다.
 * 미분류(null)는 그대로 둡니다.
 */
export function migratePhotoCategory(category: CategoryColor, seed: string): CategoryColor {
  if (!category || category === UNCLASSIFIED_KEY) return null;
  if (isPlaceCategoryId(category)) return category;
  return pickRandomPlaceCategory(seed);
}

export function migratePhotosToPlaceCategories<T extends { id: string; category: CategoryColor }>(photos: T[]): T[] {
  return photos.map((photo) => ({
    ...photo,
    category: migratePhotoCategory(photo.category, photo.id),
  }));
}
