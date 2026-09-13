"use client";

import { AlbumMapDynamic } from "@/components/map/AlbumMapDynamic";
import { ColorPinFilter } from "@/components/map/ColorPinFilter";
import { CountrySelectButton } from "@/components/map/CountrySelectButton";
import { CountrySelectModal } from "@/components/map/CountrySelectModal";
import { TimePicker } from "@/components/map/TimePicker";
import { ZoomControls } from "@/components/map/ZoomControls";
import { useMap } from "@/context/map-context";
import { OVERLAY_LABEL } from "@/lib/zoom";

/**
 * 줌은 Mapbox 휠·핀치와 왼쪽 +/- 버튼이 함께 담당합니다.
 */
export function MapScreen() {
  const { overlayMode, mapZoom, filteredPhotos, settings } = useMap();
  const dark = settings.mapTheme === "dark";

  return (
    <section className={`relative flex min-h-0 flex-1 flex-col ${dark ? "bg-[#111]" : "bg-white"}`}>
      <div className="absolute inset-0">
        <AlbumMapDynamic />
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-8 top-1/2 z-10 -translate-y-1/2 rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 text-center text-sm text-neutral-600 shadow-sm">
          이 조건에 맞는 사진이 없어요. 연도·색 필터를 바꿔 보세요.
        </div>
      ) : null}

      {/* TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 상단 왼쪽 국가 선택 */}
      <div className="absolute top-4 left-4 z-20">
        <CountrySelectButton />
      </div>

      <div className="absolute top-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-neutral-200 bg-white/85 px-2.5 py-1 text-[11px] text-neutral-600 shadow-sm">
        z {mapZoom.toFixed(1)} · {OVERLAY_LABEL[overlayMode]}
      </div>

      {/* TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 상단 오른쪽 컬러핀 */}
      <div className="absolute top-16 right-3 z-20">
        <ColorPinFilter />
      </div>

      <ZoomControls />

      <div className="absolute inset-x-0 bottom-[4.35rem] z-20">
        <TimePicker />
      </div>

      <p className="pointer-events-none absolute bottom-[9.15rem] left-0 right-0 text-center text-[11px] text-neutral-500">
        휠·트랙패드·핀치로 연속 줌 ·{" "}
        {overlayMode === "dots"
          ? "점의 진하기 = 사진 밀도 · 줌 9.5에서 흰 지도로"
          : overlayMode === "clusters"
            ? "묶음을 누르면 거리 수준으로 들어갑니다"
            : "사진을 누르면 상세가 열립니다"}
      </p>

      <CountrySelectModal />
    </section>
  );
}
