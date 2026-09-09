import { charToProvince, type CountryMeta } from "@/data/country-masks";
import type { DotCell, GeoBounds, Photo } from "@/types/album";

/**
 * 마스크 한 줄의 칸 → 위경도 점.
 *
 * 왜 미리 점 배열을 만들어 두나요?
 * 렌더마다 문자열을 파싱하면 줌/필터가 바뀔 때마다 같은 일을 반복합니다.
 * 마스크는 불변이므로 모듈 로드 시 한 번만 변환합니다.
 */
export function maskToDots(country: CountryMeta): DotCell[] {
  const { mask, bounds, id } = country;
  const width = Math.max(...mask.map((row) => row.length));
  const height = mask.length;
  const dots: DotCell[] = [];

  mask.forEach((line, row) => {
    const padded = line.padEnd(width, " ");
    for (let col = 0; col < width; col += 1) {
      const ch = padded[col] ?? " ";
      if (ch === " ") continue;

      dots.push({
        row,
        col,
        countryId: id,
        provinceId: charToProvince(ch),
        // 행이 커질수록 남쪽(위도 감소), 열이 커질수록 동쪽(경도 증가)
        lat: bounds.maxLat - ((row + 0.5) / height) * (bounds.maxLat - bounds.minLat),
        lng: bounds.minLng + ((col + 0.5) / width) * (bounds.maxLng - bounds.minLng),
      });
    }
  });

  return dots;
}

export function projectToView(
  lat: number,
  lng: number,
  bounds: GeoBounds,
  width: number,
  height: number,
): { x: number; y: number } {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;
  return { x, y };
}

/** 도시 지도에서 초점 주변만 잘라 보기 위한 사각형 */
export function boundsFromFocus(lat: number, lng: number, span: number, aspect = 0.72): GeoBounds {
  const lngSpan = span * aspect * 1.35;
  return {
    minLat: lat - span / 2,
    maxLat: lat + span / 2,
    minLng: lng - lngSpan / 2,
    maxLng: lng + lngSpan / 2,
  };
}

/**
 * 점과 사진 사이 대략 거리. 정확한 지구 거리(haversine) 대신 위경도 차를 씁니다.
 * 국가 화면에서는 "어느 점이 더 가까운가"만 중요해서, 무거운 삼각함수는 과합니다.
 */
export function approxDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = a.lat - b.lat;
  const dLng = (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** 이 점에 가장 가까운 사진 개수. 너무 멀면 0으로 잘라 바다가 검게 물들지 않게 합니다. */
export function photoCountNearDot(dot: DotCell, photos: Photo[], radius: number): number {
  return photos.filter((photo) => {
    if (photo.countryId !== dot.countryId) return false;
    return approxDistance(dot, photo) <= radius;
  }).length;
}

export function dominantCategory(photos: Photo[]) {
  const counts = new Map<string, number>();
  photos.forEach((photo) => {
    const key = photo.category ?? "unclassified";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  let best: string = "unclassified";
  let bestCount = 0;
  counts.forEach((count, key) => {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  });
  return best;
}

export function photosNearDot(dot: DotCell, photos: Photo[], radius: number) {
  return photos.filter((photo) => {
    if (photo.countryId !== dot.countryId) return false;
    return approxDistance(dot, photo) <= radius;
  });
}

/**
 * 시/도 수준에서 행정 경계를 "빈 점"으로 보여 주기 위해
 * 이웃 칸의 시/도가 다르면 경계 점으로 판정합니다.
 */
export function isProvinceBoundary(dot: DotCell, all: DotCell[]) {
  const neighbors = all.filter(
    (other) => Math.abs(other.row - dot.row) <= 1 && Math.abs(other.col - dot.col) <= 1 && other !== dot,
  );
  return neighbors.some((other) => other.provinceId !== dot.provinceId);
}
