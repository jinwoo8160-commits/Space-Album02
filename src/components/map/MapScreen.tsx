"use client";

import { ColorPinFilter } from "@/components/map/ColorPinFilter";
import { CountrySelectButton } from "@/components/map/CountrySelectButton";
import { CountrySelectModal } from "@/components/map/CountrySelectModal";
import { DotMap } from "@/components/map/DotMap";
import { PhotoDetailModal } from "@/components/map/PhotoDetailModal";
import { StreetMap } from "@/components/map/StreetMap";
import { TimePicker } from "@/components/map/TimePicker";
import { useMap } from "@/context/map-context";
import { ZOOM_LABEL } from "@/lib/constants";
import { Minus, Plus } from "lucide-react";
import { useRef, type ReactNode } from "react";

/**
 * 지도 탭의 레이아웃 뼈대.
 * 실제 지도(도트 vs 스트리트)는 줌 레벨 한 값으로 갈라집니다.
 *
 * 휠/버튼 줌:
 * 브라우저 휠 이벤트의 deltaY < 0 이 확대입니다.
 * 터치 핀치는 1차에서 버튼·클릭으로 대체했습니다. (학습 부담을 줄이기 위함)
 */
export function MapScreen() {
  const { zoomLevel, zoomIn, zoomOut, filteredPhotos, selectedCountryId } = useMap();
  const useDots = zoomLevel === "country" || zoomLevel === "province";
  const lastWheelAt = useRef(0);

  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col bg-white"
      onWheel={(event) => {
        // 휠 한 번에 줌이 4단계 전부 건너뛰지 않도록 간격을 둡니다.
        const now = Date.now();
        if (now - lastWheelAt.current < 420) return;
        lastWheelAt.current = now;
        if (event.deltaY < 0) zoomIn();
        else zoomOut();
      }}
    >
      {useDots ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pt-16 pb-36">
          <DotMap />
        </div>
      ) : (
        <StreetMap />
      )}

      {filteredPhotos.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-8 top-1/2 z-10 -translate-y-1/2 rounded-2xl bg-white/80 px-4 py-3 text-center text-sm text-neutral-500 shadow-sm">
          이 조건에 맞는 사진이 없어요. 연도·색 필터를 바꿔 보세요.
        </div>
      ) : null}

      {/* TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 상단 왼쪽 국가 선택 */}
      <div className="absolute top-4 left-4 z-20">
        <CountrySelectButton />
      </div>

      <div className="absolute top-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-neutral-500 shadow-sm">
        {ZOOM_LABEL[zoomLevel]}
      </div>

      {/* TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 상단 오른쪽 컬러핀 */}
      <div className="absolute top-16 right-3 z-20">
        <ColorPinFilter />
      </div>

      <div className="absolute top-[52%] left-3 z-20 flex -translate-y-1/2 flex-col gap-2">
        <ZoomButton label="확대" onClick={() => zoomIn()}>
          <Plus className="size-4" />
        </ZoomButton>
        <ZoomButton label="축소" onClick={zoomOut}>
          <Minus className="size-4" />
        </ZoomButton>
      </div>

      <div className="absolute inset-x-0 bottom-24 z-20">
        <TimePicker />
      </div>

      {useDots ? (
        <p className="pointer-events-none absolute bottom-52 left-0 right-0 text-center text-[11px] text-neutral-400">
          {selectedCountryId === "kr" ? "진한 점 = 사진이 많은 곳 · 점을 눌러 확대" : "점을 누르거나 + 로 확대"}
        </p>
      ) : (
        <p className="pointer-events-none absolute bottom-52 left-0 right-0 text-center text-[11px] text-neutral-400">
          {zoomLevel === "city" ? "묶음을 누르면 동 수준으로 들어갑니다" : "사진을 누르면 상세가 열립니다"}
        </p>
      )}

      <CountrySelectModal />
      <PhotoDetailModal />
    </section>
  );
}

function ZoomButton({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md"
    >
      {children}
    </button>
  );
}
