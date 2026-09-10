"use client";

import { ScenicPhoto } from "@/components/map/ScenicPhoto";
import { useMap } from "@/context/map-context";
import { hexForCategory } from "@/lib/constants";
import { hexByCategoryList } from "@/lib/categories";
import { formatTakenAt } from "@/lib/album";
import { ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * 지도 핀·기록 그리드가 같이 쓰는 상세 모달.
 * 연대기 이전/다음은 화살표, 키보드, 스와이프로 움직입니다.
 */
export function PhotoDetailModal() {
  const {
    selectedPhoto,
    closePhoto,
    setPhotoCategory,
    keyCategories,
    stepAlbumPhoto,
    albumIndex,
    albumCount,
  } = useMap();
  const [slide, setSlide] = useState<"next" | "prev" | "in">("in");
  const hexById = useMemo(() => hexByCategoryList(keyCategories), [keyCategories]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (delta: -1 | 1) => {
      if (delta < 0 && albumIndex <= 0) return;
      if (delta > 0 && albumIndex >= albumCount - 1) return;
      setSlide(delta > 0 ? "next" : "prev");
      stepAlbumPhoto(delta);
    },
    [albumCount, albumIndex, stepAlbumPhoto],
  );

  useEffect(() => {
    if (!selectedPhoto) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === "Escape") {
        closePhoto();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePhoto, go, selectedPhoto]);

  if (!selectedPhoto) return null;

  const hasPrev = albumIndex > 0;
  const hasNext = albumIndex < albumCount - 1;
  const categoryHex = hexForCategory(selectedPhoto.category, hexById);
  const categoryName =
    selectedPhoto.category === null
      ? "카테고리 없음"
      : (keyCategories.find((item) => item.id === selectedPhoto.category)?.name ?? "카테고리 없음");

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/25 px-5 pb-28 pt-16">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="닫기" onClick={closePhoto} />
      <div className="relative z-10 w-full max-w-[300px] rounded-2xl bg-white p-3 shadow-2xl">
        <div
          key={selectedPhoto.id}
          className={
            slide === "prev"
              ? "animate-in fade-in slide-in-from-left-6 duration-300"
              : slide === "next"
                ? "animate-in fade-in slide-in-from-right-6 duration-300"
                : "animate-in fade-in duration-200"
          }
        >
          <div
            className="relative overflow-hidden rounded-md bg-neutral-100 touch-pan-y"
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) return;
              touchStart.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerUp={(event) => {
              const start = touchStart.current;
              touchStart.current = null;
              if (!start) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
              go(dx < 0 ? 1 : -1);
            }}
            onPointerCancel={() => {
              touchStart.current = null;
            }}
          >
            <ScenicPhoto scene={selectedPhoto.scene} className="aspect-square w-full" />
            <button
              type="button"
              onClick={closePhoto}
              className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/35 text-white"
              aria-label="닫기"
            >
              <X className="size-4" />
            </button>
            {hasPrev ? (
              <button
                type="button"
                aria-label="이전 사진"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white"
              >
                <ChevronLeft className="size-4" />
              </button>
            ) : null}
            {hasNext ? (
              <button
                type="button"
                aria-label="다음 사진"
                onClick={() => go(1)}
                className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white"
              >
                <ChevronRight className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="space-y-1 px-1 pt-3">
            <p className="font-[family-name:var(--font-hand)] text-lg leading-tight">
              {selectedPhoto.title}
            </p>
            <p className="flex items-start gap-1 text-[13px] text-neutral-500">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              {selectedPhoto.locationLabel}
            </p>
            <p className="text-[12px] text-neutral-400">
              {formatTakenAt(selectedPhoto.takenAt)} · {selectedPhoto.districtLabel}
            </p>
            <p className="flex items-center gap-1.5 pt-0.5 text-[12px] text-neutral-500">
              {selectedPhoto.category ? (
                <span className="size-2.5 rounded-full" style={{ backgroundColor: categoryHex }} />
              ) : null}
              {categoryName}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 px-1 pt-3 pb-1">
            <p className="shrink-0 text-[12px] text-neutral-500">카테고리 색 지정</p>
            <div className="flex flex-wrap justify-end gap-2">
              {keyCategories.map((category) => {
                const selected = selectedPhoto.category === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-label={`${category.name} 지정`}
                    onClick={() => setPhotoCategory(selectedPhoto.id, category.id)}
                    className="size-7 rounded-full"
                    style={{
                      backgroundColor: category.hex,
                      boxShadow: selected ? `0 0 0 2px white, 0 0 0 4px ${category.hex}` : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
