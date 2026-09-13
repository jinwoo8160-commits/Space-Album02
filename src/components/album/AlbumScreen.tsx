"use client";

import { ScenicPhoto } from "@/components/map/ScenicPhoto";
import { useMap } from "@/context/map-context";
import {
  ALBUM_RANGES,
  formatPeriodLabel,
  photosInPeriod,
  shiftPeriod,
  type AlbumRange,
} from "@/lib/album-period";
import { sortPhotosByTakenAt } from "@/lib/album";
import { hexByCategoryList, hexForCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const AlbumMiniMap = dynamic(
  () => import("@/components/album/AlbumMiniMap").then((mod) => mod.AlbumMiniMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-white" /> },
);

/**
 * 앨범 탭. 년/월/주/일로 기간을 고르고, 한반도 미니 지도와 사진 그리드를 같이 보여 줍니다.
 */
export function AlbumScreen() {
  const { photos, openPhoto, keyCategories } = useMap();
  const [range, setRange] = useState<AlbumRange>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const hexById = useMemo(() => hexByCategoryList(keyCategories), [keyCategories]);

  const periodPhotos = useMemo(
    () => sortPhotosByTakenAt(photosInPeriod(photos, range, cursor), "desc"),
    [photos, range, cursor],
  );
  const mapPhotos = useMemo(
    () => periodPhotos.filter((photo) => photo.hasGps !== false),
    [periodPhotos],
  );
  const pinnedPhoto = periodPhotos.find((photo) => photo.id === pinnedId) ?? null;
  const pinColor = pinnedPhoto?.category ? hexForCategory(pinnedPhoto.category, hexById) : "#111111";

  const selectRange = (next: AlbumRange) => {
    setPinnedId(null);
    setRange(next);
  };

  const step = (delta: -1 | 1) => {
    setPinnedId(null);
    setCursor((prev) => shiftPeriod(prev, range, delta));
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="px-5 pt-4">
        <div className="flex rounded-full bg-neutral-200/80 p-1">
          {ALBUM_RANGES.map((item) => {
            const active = range === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectRange(item.id)}
                className={cn(
                  "h-9 flex-1 rounded-full text-[15px] font-medium",
                  active ? "bg-neutral-900 text-white" : "text-neutral-400",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-3 h-[210px] shrink-0">
        <AlbumMiniMap photos={mapPhotos} pinnedPhoto={pinnedPhoto} pinColor={pinColor} />
        <button
          type="button"
          aria-label="이전 기간"
          onClick={() => step(-1)}
          className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center text-neutral-400"
        >
          <ChevronLeft className="size-8" strokeWidth={1.7} />
        </button>
        <button
          type="button"
          aria-label="다음 기간"
          onClick={() => step(1)}
          className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center text-neutral-400"
        >
          <ChevronRight className="size-8" strokeWidth={1.7} />
        </button>
      </div>

      <p className="py-3 text-center text-[16px] font-medium text-neutral-800">
        {formatPeriodLabel(range, cursor)}
      </p>

      {periodPhotos.length === 0 ? (
        <p className="flex flex-1 items-start justify-center px-8 pt-10 text-center text-[14px] leading-relaxed text-neutral-400">
          이 기간에 등록된 추억이 없습니다.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-28">
          <div className="grid grid-cols-5 gap-2">
            {periodPhotos.map((photo) => {
              const hex = photo.category ? hexForCategory(photo.category, hexById) : null;
              const canPin = Boolean(hex && photo.hasGps !== false);
              const pinned = pinnedId === photo.id;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => openPhoto(photo.id)}
                  className="relative aspect-square overflow-hidden rounded-[14px] bg-neutral-100"
                  aria-label={photo.title}
                >
                  <ScenicPhoto scene={photo.scene} className="h-full w-full" />
                  {canPin && hex ? (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={pinned ? "위치 핀 해제" : "위치 핀"}
                      aria-pressed={pinned}
                      onClick={(event) => {
                        event.stopPropagation();
                        setPinnedId((current) => (current === photo.id ? null : photo.id));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          setPinnedId((current) => (current === photo.id ? null : photo.id));
                        }
                      }}
                      className={cn(
                        "absolute bottom-1 left-1 size-2.5 rounded-full ring-2",
                        pinned ? "ring-neutral-900" : "ring-white/95",
                      )}
                      style={{ backgroundColor: hex }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
