"use client";

import { ScenicPhoto } from "@/components/map/ScenicPhoto";
import { UNCLASSIFIED_HEX } from "@/lib/constants";
import { useMap } from "@/context/map-context";
import { MapPin, Plus, X } from "lucide-react";

export function PhotoDetailModal() {
  const { selectedPhoto, closePhoto, setPhotoCategory, keyCategories } = useMap();
  if (!selectedPhoto) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/25 px-5 pb-28 pt-16">
      <div className="relative w-full max-w-[300px] rounded-2xl bg-white p-3 shadow-2xl">
        <div className="relative overflow-hidden rounded-md bg-neutral-100">
          <ScenicPhoto scene={selectedPhoto.scene} className="aspect-square w-full" />
          <button
            type="button"
            onClick={closePhoto}
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/35 text-white"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
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
            <button
              type="button"
              aria-label="미분류 지정"
              onClick={() => setPhotoCategory(selectedPhoto.id, null)}
              className="size-7 rounded-full"
              style={{
                backgroundColor: UNCLASSIFIED_HEX,
                boxShadow:
                  selectedPhoto.category === null
                    ? `0 0 0 2px white, 0 0 0 4px ${UNCLASSIFIED_HEX}`
                    : undefined,
              }}
            >
              <Plus className="mx-auto size-3.5 text-white" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTakenAt(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}
