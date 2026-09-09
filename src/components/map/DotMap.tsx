"use client";

import { COUNTRY_DOTS, useCountryMeta, useMap } from "@/context/map-context";
import { CATEGORY_HEX, UNCLASSIFIED_HEX } from "@/lib/constants";
import {
  dominantCategory,
  isProvinceBoundary,
  photoCountNearDot,
  photosNearDot,
} from "@/lib/geo";
import type { CategoryFilterKey, DotCell, Photo } from "@/types/album";
import { useMemo } from "react";

/**
 * 국가 / 시·도 수준의 점묘 지도.
 *
 * 동작 원리:
 * 1) 나라 마스크에서 만든 점(dot)은 위치가 고정입니다.
 * 2) 지금 필터를 통과한 사진만 점 주변에 세어 명암을 정합니다.
 *    → 연도를 바꾸면 진한 점이 옮겨 가는 이유입니다.
 * 3) 그 칸의 대표 카테고리 색이 있으면 회색 대신 그 색을 씁니다.
 *    (요구사항: 카테고리 색 ↔ 도트 색 실시간 연동)
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * 점 크기·간격·회색 스케일을 스케치 1~2에 더 맞추고 싶을 때 이 파일의 r / fill 만 조절하면 됩니다.
 */
export function DotMap() {
  const { filteredPhotos, zoomLevel, jumpToCity, zoomIn } = useMap();
  const country = useCountryMeta();
  const dots = COUNTRY_DOTS[country.id];

  const width = Math.max(...country.mask.map((row) => row.length));
  const height = country.mask.length;
  const radius = zoomLevel === "province" ? 0.28 : 0.34;
  const countRadius = zoomLevel === "province" ? 0.55 : 0.9;

  const painted = useMemo(() => {
    const maxCount = Math.max(
      1,
      ...dots.map((dot) => photoCountNearDot(dot, filteredPhotos, countRadius)),
    );

    return dots
      .filter((dot) => {
        if (zoomLevel !== "province") return true;
        return !isProvinceBoundary(dot, dots);
      })
      .map((dot) => {
        const nearby = photosNearDot(dot, filteredPhotos, countRadius);
        const count = nearby.length;
        return {
          dot,
          count,
          fill: fillForDot(nearby, count, maxCount),
        };
      });
  }, [dots, filteredPhotos, zoomLevel, countRadius]);

  return (
    <svg
      viewBox={`-1 -1 ${width + 2} ${height + 2}`}
      className="h-full w-full max-h-[520px]"
      role="img"
      aria-label={`${country.name} 도트 맵`}
      onClick={() => {
        if (zoomLevel === "country") zoomIn();
      }}
    >
      {painted.map(({ dot, fill, count }) => (
        <circle
          key={`${dot.row}-${dot.col}`}
          cx={dot.col + 0.5}
          cy={dot.row + 0.5}
          r={radius}
          fill={fill}
          className="cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            handleDotClick(dot, count, zoomLevel, jumpToCity, zoomIn);
          }}
        />
      ))}
    </svg>
  );
}

function handleDotClick(
  dot: DotCell,
  count: number,
  zoomLevel: "country" | "province" | "city" | "neighborhood",
  jumpToCity: (lat: number, lng: number) => void,
  zoomIn: (around?: { lat: number; lng: number }) => void,
) {
  if (zoomLevel === "country") {
    zoomIn({ lat: dot.lat, lng: dot.lng });
    return;
  }
  if (zoomLevel === "province") {
    if (count > 0) jumpToCity(dot.lat, dot.lng);
    else zoomIn({ lat: dot.lat, lng: dot.lng });
  }
}

function fillForDot(nearby: Photo[], count: number, maxCount: number) {
  if (count === 0) return "#e8e8e8";

  const t = Math.sqrt(count / maxCount);
  const dominant = dominantCategory(nearby) as CategoryFilterKey | "unclassified";

  if (dominant === "unclassified") {
    const shade = Math.round(210 - t * 190);
    return `rgb(${shade}, ${shade}, ${shade})`;
  }

  return mixHex(CATEGORY_HEX[dominant] ?? UNCLASSIFIED_HEX, "#f3f3f3", 1 - t * 0.85);
}

function mixHex(hex: string, other: string, otherWeight: number) {
  const a = hexToRgb(hex);
  const b = hexToRgb(other);
  const w = Math.min(1, Math.max(0, otherWeight));
  const r = Math.round(a.r * (1 - w) + b.r * w);
  const g = Math.round(a.g * (1 - w) + b.g * w);
  const bl = Math.round(a.b * (1 - w) + b.b * w);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string) {
  const raw = hex.replace("#", "");
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
}
