"use client";

import dynamic from "next/dynamic";

/** Mapbox GL 은 window/WebGL 이 필요하므로 브라우저에서만 불러옵니다. */
export const AlbumMapDynamic = dynamic(
  () => import("@/components/map/AlbumMap").then((mod) => mod.AlbumMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-white text-sm text-neutral-500">
        지도를 불러오는 중…
      </div>
    ),
  },
);
