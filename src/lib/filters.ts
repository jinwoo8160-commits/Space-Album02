import type { CategoryColor, CategoryFilterKey, Photo, TimeFilter } from "@/types/album";

/**
 * 지도에 그릴 사진 = 원본 배열을 여러 체로 거른 결과.
 *
 * 왜 원본을 직접 splice 하지 않나요?
 * - 카테고리를 다시 "전체"로 돌리거나 연도를 바꾸면 사라진 사진이 복구되어야 합니다.
 * - 그래서 photos(원본에 가까운 상태)는 유지하고, 화면용 배열은 매번 새로 계산합니다.
 *
 * 거르는 순서: 국가 → 날짜 → 색.
 * 순서가 바뀌어도 수학적으로는 같지만, 디버깅할 때 "어느 체가 비웠는지" 따라가기 쉽습니다.
 */
export function filterPhotos(
  photos: Photo[],
  countryId: string,
  time: TimeFilter,
  selectedCategories: Set<CategoryFilterKey>,
): Photo[] {
  return photos.filter((photo) => {
    if (photo.hasGps === false) return false;
    if (photo.countryId !== countryId) return false;
    if (!matchesTime(photo, time)) return false;
    if (!matchesCategory(photo.category, selectedCategories)) return false;
    return true;
  });
}

function matchesTime(photo: Photo, time: TimeFilter) {
  const date = new Date(photo.takenAt);
  if (date.getFullYear() !== time.year) return false;
  // month 가 null 이면 "그 해 전체". 일(day)도 자연스럽게 무시됩니다.
  if (time.month !== null && date.getMonth() + 1 !== time.month) return false;
  if (time.day !== null && date.getDate() !== time.day) return false;
  return true;
}

/**
 * 컬러핀 필터 규칙 (요구사항):
 * - 아무 핀도 안 고름 → 카테고리 없음 포함 전체
 * - 하나 이상 고름 → 고른 색만
 */
function matchesCategory(category: CategoryColor, selected: Set<CategoryFilterKey>) {
  if (selected.size === 0) return true;
  if (category === null) return false;
  return selected.has(category);
}
