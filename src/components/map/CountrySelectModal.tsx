"use client";

import { COUNTRIES, WORLD_COUNTRY } from "@/data/country-masks";
import { MOCK_PHOTOS } from "@/data/mock-photos";
import { COUNTRY_DOTS, useMap } from "@/context/map-context";
import { maskToDots } from "@/lib/geo";
import type { CountryId, DotCell } from "@/types/album";
import { Share } from "lucide-react";
import { useMemo } from "react";

/**
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * 이미지 6: 세계 도트맵 + 지역 배지 2x2 (대한민국/일본/중국/미국)
 *
 * 왜 전체 화면 오버레이인가?
 * shadcn Dialog 는 작은 카드형 모달에 최적화되어 있습니다.
 * 스케치는 지도 화면을 배지 갤러리로 "갈아끼우는" 레이아웃이라
 * 폰 프레임 안을 덮는 패널이 더 비슷합니다.
 */
export function CountrySelectModal() {
  const { countryModalOpen, setCountryModalOpen, setSelectedCountryId, selectedCountryId } =
    useMap();

  if (!countryModalOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#f7f7f7]">
      <div className="flex items-center justify-between px-5 pt-5">
        <p className="text-sm font-medium text-neutral-500">나라를 고르면 지도가 바뀝니다</p>
        <button
          type="button"
          className="text-sm text-neutral-500"
          onClick={() => setCountryModalOpen(false)}
        >
          닫기
        </button>
      </div>

      <div className="relative px-4 pt-2">
        <WorldDotPreview />
        <button
          type="button"
          aria-label="공유"
          className="absolute right-6 bottom-1 flex size-8 items-center justify-center text-neutral-700"
          onClick={async () => {
            const text = `시공간 앨범 · ${COUNTRIES.length}개국 · ${MOCK_PHOTOS.length}장의 사진`;
            try {
              await navigator.clipboard.writeText(text);
            } catch {
              /* 클립보드 권한이 없어도 모달은 그대로 둡니다. */
            }
          }}
        >
          {/* TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 세계 지도 우측 공유 아이콘 */}
          <Share className="size-5" />
        </button>
      </div>

      <h2 className="px-6 pt-4 text-[15px] font-semibold tracking-tight text-neutral-900">
        지역 배지
      </h2>

      <div className="grid flex-1 grid-cols-2 content-start gap-x-2 gap-y-6 px-4 pt-4">
        {COUNTRIES.map((country) => (
          <button
            key={country.id}
            type="button"
            onClick={() => setSelectedCountryId(country.id)}
            className="flex flex-col items-center gap-2"
          >
            <MiniCountryBadge countryId={country.id} selected={selectedCountryId === country.id} />
            <span className="text-[13px] text-neutral-800">{country.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorldDotPreview() {
  const dots = useMemo(() => maskToDots(WORLD_COUNTRY), []);
  const width = Math.max(...WORLD_COUNTRY.mask.map((row) => row.length));
  const height = WORLD_COUNTRY.mask.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full">
      {dots.map((dot) => {
        const hot =
          (dot.col > width * 0.12 && dot.col < width * 0.38 && dot.row < height * 0.45) ||
          (dot.col > width * 0.62 && dot.row < height * 0.5);
        return (
          <circle
            key={`${dot.row}-${dot.col}`}
            cx={dot.col + 0.5}
            cy={dot.row + 0.5}
            r={0.32}
            fill={hot ? "#111" : "#d4d4d4"}
          />
        );
      })}
    </svg>
  );
}

function MiniCountryBadge({
  countryId,
  selected,
}: {
  countryId: CountryId;
  selected: boolean;
}) {
  const country = COUNTRIES.find((item) => item.id === countryId)!;
  const dots = COUNTRY_DOTS[countryId];
  const width = Math.max(...country.mask.map((row) => row.length));
  const height = country.mask.length;

  return (
    <div className={selected ? "rounded-xl ring-2 ring-neutral-900 ring-offset-2" : ""}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-36">
        {dots.map((dot) => (
          <circle
            key={`${dot.row}-${dot.col}`}
            cx={dot.col + 0.5}
            cy={dot.row + 0.5}
            r={0.38}
            fill={isHotDot(countryId, dot) ? "#111" : "#d6d6d6"}
          />
        ))}
      </svg>
    </div>
  );
}

function isHotDot(countryId: CountryId, dot: DotCell) {
  if (countryId === "kr") {
    return (
      (dot.provinceId === "seoul-gyeonggi" && (dot.row + dot.col) % 3 === 0) ||
      (dot.provinceId === "gyeongsang" && (dot.row + dot.col) % 4 === 0)
    );
  }
  if (countryId === "jp") return dot.row > 8 && dot.row < 16 && dot.col % 2 === 0;
  if (countryId === "cn") return dot.row > 6 && dot.col > 12 && (dot.row + dot.col) % 3 === 0;
  if (countryId === "us") return dot.row < 8 && dot.col > 16 && dot.col % 2 === 0;
  return false;
}
