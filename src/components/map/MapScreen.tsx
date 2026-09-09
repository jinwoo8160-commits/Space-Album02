"use client";

import { AlbumMapDynamic } from "@/components/map/AlbumMapDynamic";
import { ColorPinFilter } from "@/components/map/ColorPinFilter";
import { CountrySelectButton } from "@/components/map/CountrySelectButton";
import { CountrySelectModal } from "@/components/map/CountrySelectModal";
import { PhotoDetailModal } from "@/components/map/PhotoDetailModal";
import { TimePicker } from "@/components/map/TimePicker";
import { useMap } from "@/context/map-context";
import { OVERLAY_LABEL } from "@/lib/zoom";
import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

/**
 * 지도 탭 레이아웃. 배경은 항상 실제 지도이고,
 * 줌 숫자에 따라 도트 / 묶음 / 개별 핀만 바뀝니다.
 *
 * 휠·핀치 줌은 MapLibre 가 처리합니다. 우리가 onWheel 로 가로채면
 * 엔진 줌과 레이어 기준(0~5 / 6~11 / 12+)이 다시 어긋납니다.
 */
export function MapScreen() {
  const { overlayMode, mapZoom, zoomIn, zoomOut, filteredPhotos } = useMap();

  return (
    <section className="relative flex min-h-0 flex-1 flex-col bg-[#f4f4f2]">
      <div className="absolute inset-0">
        <AlbumMapDynamic />
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-8 top-1/2 z-10 -translate-y-1/2 rounded-2xl bg-white/85 px-4 py-3 text-center text-sm text-neutral-500 shadow-sm">
          이 조건에 맞는 사진이 없어요. 연도·색 필터를 바꿔 보세요.
        </div>
      ) : null}

      {/* TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 상단 왼쪽 국가 선택 */}
      <div className="absolute top-4 left-4 z-20">
        <CountrySelectButton />
      </div>

      <div className="absolute top-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-neutral-500 shadow-sm">
        z {mapZoom.toFixed(1)} · {OVERLAY_LABEL[overlayMode]}
      </div>

      {/* TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 상단 오른쪽 컬러핀 */}
      <div className="absolute top-16 right-3 z-20">
        <ColorPinFilter />
      </div>

      <div className="absolute top-[46%] left-3 z-20 flex -translate-y-1/2 flex-col gap-2">
        <ZoomButton label="확대" onClick={zoomIn}>
          <Plus className="size-4" />
        </ZoomButton>
        <ZoomButton label="축소" onClick={zoomOut}>
          <Minus className="size-4" />
        </ZoomButton>
      </div>

      <div className="absolute inset-x-0 bottom-24 z-20">
        <TimePicker />
      </div>

      <p className="pointer-events-none absolute bottom-52 left-0 right-0 text-center text-[11px] text-neutral-500">
        {overlayMode === "dots"
          ? "작은 점의 진하기 = 사진 밀도 · 점을 누르면 시·구로 확대"
          : overlayMode === "clusters"
            ? "묶음을 누르면 동/거리 수준으로 들어갑니다"
            : "사진을 누르면 상세가 열립니다"}
      </p>

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
