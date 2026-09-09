"use client";

import { useMap } from "@/context/map-context";
import { MIN_MAP_ZOOM } from "@/lib/zoom";
import { Minus, Plus } from "lucide-react";

export function ZoomControls() {
  const { mapRef, mapZoom } = useMap();
  const atMin = mapZoom <= MIN_MAP_ZOOM + 0.04;

  return (
    <div className="absolute top-1/2 left-5 z-20 flex -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white/92 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <button
        type="button"
        aria-label="확대"
        className="flex size-10 items-center justify-center text-neutral-800 hover:bg-neutral-50"
        onClick={() => mapRef.current?.getMap().zoomIn({ duration: 300 })}
      >
        <Plus className="size-4" strokeWidth={2.4} />
      </button>
      <div className="h-px bg-neutral-200" />
      <button
        type="button"
        aria-label="축소"
        disabled={atMin}
        className="flex size-10 items-center justify-center text-neutral-800 hover:bg-neutral-50 disabled:opacity-35"
        onClick={() => {
          if (atMin) return;
          mapRef.current?.getMap().zoomOut({ duration: 300 });
        }}
      >
        <Minus className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}
