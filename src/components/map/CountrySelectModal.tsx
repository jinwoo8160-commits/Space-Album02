"use client";

import { COUNTRIES } from "@/data/country-masks";
import { useMap } from "@/context/map-context";
import { unlockCountryMessage } from "@/lib/korean";
import type { CountryId } from "@/types/album";
import { Lock } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

const CountryMiniMap = dynamic(
  () => import("@/components/map/CountryMiniMap").then((mod) => mod.CountryMiniMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white" />,
  },
);

const UNLOCKED_COUNTRY_ID: CountryId = "kr";

/**
 * 국가 선택 패널. 세계지도는 프리뷰만 보여 주고, 지금은 대한민국만 고를 수 있습니다.
 */
export function CountrySelectModal() {
  const { countryModalOpen, setCountryModalOpen, setSelectedCountryId, selectedCountryId } =
    useMap();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!countryModalOpen) return null;

  const noticeLocked = (name: string) => {
    setToast(unlockCountryMessage(name));
  };

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

      {/*
        세계지도는 국가 선택지가 아니라 시각 프리뷰만 보여 준다.
        자물쇠·딤·클릭 토스트를 빼고, 지도 영역은 pointer-events로 입력을 막는다.
      */}
      <div className="relative px-4 pt-2">
        <div className="pointer-events-none relative h-36 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <CountryMiniMap id="world" className="h-full w-full" />
        </div>
      </div>

      <h2 className="px-6 pt-4 text-[15px] font-semibold tracking-tight text-neutral-900">
        지역 선택
      </h2>

      <div className="grid flex-1 grid-cols-2 content-start gap-x-2 gap-y-6 px-4 pt-4">
        {COUNTRIES.map((country) => {
          const locked = country.id !== UNLOCKED_COUNTRY_ID;
          const selected = selectedCountryId === country.id;
          return (
            <button
              key={country.id}
              type="button"
              aria-disabled={locked}
              aria-label={locked ? `${country.name} (잠김)` : country.name}
              onClick={() => {
                if (locked) {
                  noticeLocked(country.name);
                  return;
                }
                setSelectedCountryId(country.id);
              }}
              className="flex flex-col items-center gap-2"
            >
              <MiniCountryBadge countryId={country.id} selected={selected} locked={locked} />
              <span className={`text-[13px] ${locked ? "text-neutral-400" : "text-neutral-800"}`}>
                {country.name}
              </span>
            </button>
          );
        })}
      </div>

      {toast ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-6 z-50 flex justify-center">
          <p className="rounded-full bg-neutral-900/92 px-3.5 py-2 text-center text-[12px] leading-snug text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            {toast}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function MiniCountryBadge({
  countryId,
  selected,
  locked,
}: {
  countryId: CountryId;
  selected: boolean;
  locked: boolean;
}) {
  return (
    <div
      className={`relative h-24 w-36 overflow-hidden rounded-xl bg-white ${
        selected && !locked ? "ring-2 ring-neutral-900 ring-offset-2" : "border border-neutral-200"
      }`}
    >
      {locked ? (
        <LockedPreview>
          <CountryMiniMap id={countryId} className="h-full w-full" />
        </LockedPreview>
      ) : (
        <CountryMiniMap id={countryId} className="h-full w-full" />
      )}
    </div>
  );
}

function LockedPreview({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full opacity-45 grayscale">{children}</div>
      <div className="pointer-events-none absolute inset-0 bg-white/25" />
      <span className="pointer-events-none absolute top-1.5 left-1/2 z-10 flex size-7 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
        <Lock className="size-3.5" strokeWidth={2.2} aria-hidden />
      </span>
    </div>
  );
}
