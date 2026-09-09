"use client";

import { categoryBorderColor, ScenicPhoto } from "@/components/map/ScenicPhoto";
import type { Photo } from "@/types/album";

/** TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 동 수준 개별 사진 핀 (손그림 테두리) */
export function PhotoPin({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  const border = categoryBorderColor(photo.category);

  return (
    <button
      type="button"
      onClick={onClick}
      className="size-14 overflow-hidden bg-white shadow-lg"
      style={{ border: `3.5px solid ${border}`, borderRadius: 4 }}
      aria-label={photo.title}
    >
      <ScenicPhoto scene={photo.scene} className="h-full w-full" />
    </button>
  );
}
