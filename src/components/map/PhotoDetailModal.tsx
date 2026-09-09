"use client";

import { ScenicPhoto } from "@/components/map/ScenicPhoto";
import { CATEGORY_HEX, CATEGORY_LABEL, UNCLASSIFIED_HEX } from "@/lib/constants";
import { useMap } from "@/context/map-context";
import type { CategoryColor, CategoryFilterKey } from "@/types/album";
import { MapPin, Plus, X } from "lucide-react";

const ASSIGN_KEYS: CategoryFilterKey[] = ["pink", "green", "cyan", "red", "unclassified"];

/**
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * 이미지 5: 큰 정사각 사진, 우측 상단 X, 카테고리 컬러핀, 위치 정보
 *
 * 왜 shadcn Dialog(포탈) 를 안 쓰나요?
 * Dialog 는 document.body 로 렌더되어 데스크톱의 폰 프레임 밖으로 나갑니다.
 * 스케치는 "지도 위에 사진이 떠 있는" 모습이라, MapScreen 안의 오버레이가 맞습니다.
 *
 * 색을 고르면 setPhotoCategory → photos state 갱신 → 도트/테두리가 같은 색을 봅니다.
 */
export function PhotoDetailModal() {
  const { selectedPhoto, closePhoto, setPhotoCategory } = useMap();
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

        <div className="flex items-center justify-between px-1 pt-3 pb-1">
          <p className="text-[12px] text-neutral-500">카테고리 색 지정</p>
          <div className="flex gap-2">
            {ASSIGN_KEYS.map((key) => {
              const category: CategoryColor = key === "unclassified" ? null : key;
              const selected = selectedPhoto.category === category;
              const bg = key === "unclassified" ? UNCLASSIFIED_HEX : CATEGORY_HEX[key];
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`${CATEGORY_LABEL[key]} 지정`}
                  onClick={() => setPhotoCategory(selectedPhoto.id, category)}
                  className="size-7 rounded-full"
                  style={{
                    backgroundColor: bg,
                    boxShadow: selected ? `0 0 0 2px white, 0 0 0 4px ${bg}` : undefined,
                  }}
                >
                  {key === "unclassified" ? (
                    <Plus className="mx-auto size-3.5 text-white" strokeWidth={3} />
                  ) : null}
                </button>
              );
            })}
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
