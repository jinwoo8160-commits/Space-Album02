"use client";

import { useMap } from "@/context/map-context";
import { MIN_MAP_ZOOM } from "@/lib/zoom";
import { Minus, Plus } from "lucide-react";

/**
 * 화면 왼쪽 가운데 +/- 그룹.
 * Mapbox `zoomIn` / `zoomOut` (300ms). 줌 5.4 에서는 − 를 끕니다.
 */
export function ZoomControls() {
  const { mapRef, mapZoom } = useMap();
  const atMin = mapZoom <= MIN_MAP_ZOOM + 0.04;

  const zoomBy = (direction: "in" | "out") => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (direction === "out") {
      if (map.getZoom() <= MIN_MAP_ZOOM + 0.04) return;
      map.zoomOut({ duration: 300 });
      return;
    }
    map.zoomIn({ duration: 300 });
  };

  return (
    <div className="absolute top-1/2 left-[20px] z-20 flex -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-[6px]">
      <button
        type="button"
        aria-label="확대"
        className="flex size-10 items-center justify-center text-neutral-800 hover:bg-neutral-50"
        onClick={() => zoomBy("in")}
      >
        <Plus className="size-4" strokeWidth={2.4} />
      </button>
      <div className="h-px bg-neutral-200" />
      <button
        type="button"
        aria-label="축소"
        disabled={atMin}
        className="flex size-10 items-center justify-center text-neutral-800 hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-35"
        onClick={() => zoomBy("out")}
      >
        <Minus className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}
