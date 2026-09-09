"use client";

import dynamic from "next/dynamic";

/**
 * MapLibre 는 window / canvas 에 의존하므로 서버에서 그리면 깨집니다.
 * ssr: false 로 브라우저에서만 불러옵니다.
 */
export const AlbumMapDynamic = dynamic(
  () => import("@/components/map/AlbumMap").then((mod) => mod.AlbumMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#f4f4f2] text-sm text-neutral-400">
        지도를 불러오는 중…
      </div>
    ),
  },
);
