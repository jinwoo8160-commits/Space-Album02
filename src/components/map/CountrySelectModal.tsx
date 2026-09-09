"use client";

import { COUNTRIES } from "@/data/country-masks";
import { MOCK_PHOTOS } from "@/data/mock-photos";
import { useMap } from "@/context/map-context";
import type { CountryId } from "@/types/album";
import { Share } from "lucide-react";
import dynamic from "next/dynamic";

const CountryMiniMap = dynamic(
  () => import("@/components/map/CountryMiniMap").then((mod) => mod.CountryMiniMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white" />,
  },
);

/**
 * 국가 선택 패널. 위는 세계 미니 지도, 아래는 나라별 Mapbox 도트 프리뷰입니다.
 * 나라 카드를 누르면 메인 지도의 국가 설정이 바뀝니다.
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
        <div className="h-36 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <CountryMiniMap id="world" className="h-full w-full" />
        </div>
        <button
          type="button"
          aria-label="공유"
          className="absolute right-6 bottom-1 z-10 flex size-8 items-center justify-center text-neutral-700"
          onClick={async () => {
            const text = `시공간 앨범 · ${COUNTRIES.length}개국 · ${MOCK_PHOTOS.length}장의 사진`;
            try {
              await navigator.clipboard.writeText(text);
            } catch {
              /* 클립보드 권한이 없어도 모달은 그대로 둡니다. */
            }
          }}
        >
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

function MiniCountryBadge({
  countryId,
  selected,
}: {
  countryId: CountryId;
  selected: boolean;
}) {
  return (
    <div
      className={`h-24 w-36 overflow-hidden rounded-xl bg-white ${
        selected ? "ring-2 ring-neutral-900 ring-offset-2" : "border border-neutral-200"
      }`}
    >
      <CountryMiniMap id={countryId} className="h-full w-full" />
    </div>
  );
}
