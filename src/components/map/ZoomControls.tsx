"use client";

import { useMap } from "@/context/map-context";
import { Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";

const MIN_ZOOM = 5.4;
const MAX_ZOOM = 17.5;
const ZOOM_STEP = 1.0;
const ZOOM_DURATION_MS = 300;
const ZOOM_EDGE = 0.04;

function nextZoomIn(targetZoom: number) {
  if (targetZoom <= MAX_ZOOM - ZOOM_STEP) return targetZoom + ZOOM_STEP;
  return MAX_ZOOM;
}

function nextZoomOut(targetZoom: number) {
  if (targetZoom >= MIN_ZOOM + ZOOM_STEP) return targetZoom - ZOOM_STEP;
  return MIN_ZOOM;
}

/**
 * 화면 왼쪽 가운데 +/- 그룹.
 * 연타 시 현재 애니메이션 줌이 아니라 최종 targetZoom 에 ZOOM_STEP 을 쌓습니다.
 */
export function ZoomControls() {
  const { mapRef, mapZoom } = useMap();
  const targetZoomRef = useRef<number | null>(null);
  const moveIdRef = useRef(0);
  const [targetZoom, setTargetZoom] = useState<number | null>(null);

  const plannedZoom = targetZoom ?? mapZoom;
  const atMin = plannedZoom <= MIN_ZOOM + ZOOM_EDGE;
  const atMax = plannedZoom >= MAX_ZOOM - ZOOM_EDGE;

  const zoomBy = (direction: "in" | "out") => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const currentTarget = targetZoomRef.current ?? map.getZoom();
    const next = direction === "in" ? nextZoomIn(currentTarget) : nextZoomOut(currentTarget);
    if (next === currentTarget && Math.abs(next - map.getZoom()) <= ZOOM_EDGE) return;

    const moveId = ++moveIdRef.current;
    targetZoomRef.current = next;
    setTargetZoom(next);
    map.easeTo({ zoom: next, duration: ZOOM_DURATION_MS, essential: true });
    map.once("zoomend", () => {
      if (moveIdRef.current !== moveId) return;
      targetZoomRef.current = null;
      setTargetZoom(null);
    });
  };

  return (
    <div className="absolute top-1/2 left-[20px] z-20 flex -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-[6px]">
      <button
        type="button"
        aria-label="확대"
        disabled={atMax}
        className="flex size-10 items-center justify-center text-neutral-800 hover:bg-neutral-50 disabled:pointer-events-none disabled:text-neutral-300 disabled:opacity-30"
        onClick={() => zoomBy("in")}
      >
        <Plus className="size-4" strokeWidth={2.4} />
      </button>
      <div className="h-px bg-neutral-200" />
      <button
        type="button"
        aria-label="축소"
        disabled={atMin}
        className="flex size-10 items-center justify-center text-neutral-800 hover:bg-neutral-50 disabled:pointer-events-none disabled:text-neutral-300 disabled:opacity-30"
        onClick={() => zoomBy("out")}
      >
        <Minus className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}
