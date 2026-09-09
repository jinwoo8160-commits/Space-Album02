"use client";

import { uniquePhotoYears } from "@/data/mock-photos";
import { useMap } from "@/context/map-context";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef } from "react";

const ITEM_H = 36;
/** 뷰포트가 칸 3개 높이이므로, 첫 값이 가운데 오려면 위아래 빈 칸이 1개면 됩니다. */
const PAD = 1;
const ALL = "ALL";
const MONTHS: (number | typeof ALL)[] = [ALL, ...Array.from({ length: 12 }, (_, i) => i + 1)];

/**
 * 하단 휠 타임피커 (Y / M / D).
 *
 * 왜 스크롤 스냅인가?
 * 네이티브 <select> 는 모바일에서 OS 팝업이 떠서 스케치의 "드럼" 느낌이 사라집니다.
 * overflow + scroll-snap 을 쓰면 위아래 숫자가 비치고, 가운데만 선택됩니다.
 *
 * 데이터 연동:
 * onScroll 에서 가운데 인덱스 → timeFilter.
 * timeFilter 가 바뀌면 MapProvider 의 filteredPhotos 가 다시 계산되고
 * 도트 명암 / 핀이 바로 바뀝니다. (추가 fetch 없음)
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 가운데 회색 캡슐 하이라이트, Y/M/D 라벨
 */
export function TimePicker() {
  const { timeFilter, setTimeFilter, photos } = useMap();
  const years = useMemo(() => uniquePhotoYears(photos), [photos]);

  const setYear = (year: number) => setTimeFilter({ ...timeFilter, year });
  const setMonth = (month: number | null) =>
    setTimeFilter({ ...timeFilter, month, day: month === null ? null : timeFilter.day });
  const setDay = (day: number | null) => setTimeFilter({ ...timeFilter, day });

  const months = MONTHS;
  const daysInMonth =
    timeFilter.month === null
      ? 31
      : new Date(timeFilter.year, timeFilter.month, 0).getDate();
  const days = useMemo<(number | typeof ALL)[]>(() => {
    if (timeFilter.month === null) return [ALL];
    return [ALL, ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  }, [timeFilter.month, daysInMonth]);

  return (
    <div className="pointer-events-auto relative mx-auto w-[min(320px,86%)]">
      <div className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-9 -translate-y-1/2 rounded-full bg-neutral-200/70" />
      <div
        className="relative grid grid-cols-3 overflow-hidden py-1"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
        }}
      >
        <WheelColumn
          values={years}
          value={timeFilter.year}
          suffix="Y"
          onChange={(value) => setYear(Number(value))}
        />
        <WheelColumn
          values={months}
          value={timeFilter.month === null ? ALL : timeFilter.month}
          suffix="M"
          onChange={(value) => setMonth(value === ALL ? null : Number(value))}
        />
        <WheelColumn
          values={timeFilter.month === null ? [ALL] : days}
          value={timeFilter.day === null ? ALL : timeFilter.day}
          suffix="D"
          onChange={(value) => setDay(value === ALL ? null : Number(value))}
        />
      </div>
    </div>
  );
}

function WheelColumn({
  values,
  value,
  suffix,
  onChange,
}: {
  values: (number | string)[];
  value: number | string;
  suffix: string;
  onChange: (value: number | string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const suppress = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const index = Math.max(0, values.findIndex((item) => item === value));
    suppress.current = true;
    el.scrollTop = index * ITEM_H;
    const id = window.setTimeout(() => {
      suppress.current = false;
    }, 80);
    return () => window.clearTimeout(id);
  }, [value, values]);

  return (
    <div
      ref={ref}
      onScroll={() => {
        const el = ref.current;
        if (!el || suppress.current) return;
        const index = Math.round(el.scrollTop / ITEM_H);
        const next = values[index];
        if (next !== undefined && next !== value) onChange(next);
      }}
      className="h-[108px] snap-y snap-mandatory overflow-y-scroll text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {Array.from({ length: PAD }).map((_, i) => (
        <div key={`pad-top-${i}`} className="h-9 snap-center" />
      ))}
      {values.map((item) => {
        const selected = item === value;
        return (
          <div
            key={String(item)}
            className={cn(
              "flex h-9 snap-center items-center justify-center gap-1 text-[15px] font-medium",
              selected ? "text-neutral-900" : "text-neutral-400",
            )}
          >
            <span>{item === ALL ? "—" : item}</span>
            {selected ? <span className="text-[11px] font-normal text-neutral-500">{suffix}</span> : null}
          </div>
        );
      })}
      {Array.from({ length: PAD }).map((_, i) => (
        <div key={`pad-bot-${i}`} className="h-9 snap-center" />
      ))}
    </div>
  );
}
