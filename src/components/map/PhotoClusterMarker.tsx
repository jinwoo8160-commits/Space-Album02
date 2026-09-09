"use client";

import { categoryBorderColor, ScenicPhoto } from "@/components/map/ScenicPhoto";
import type { PhotoCluster } from "@/types/album";

/**
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * 스케치 3~4의 손그림 테두리 폴라로이드 스택 + 손글씨 숫자 배지
 */
export function PhotoClusterMarker({
  cluster,
  onClick,
}: {
  cluster: PhotoCluster;
  onClick: () => void;
}) {
  const top = cluster.photos.slice(0, 3);
  const border = categoryBorderColor(top[0]?.category ?? null);

  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center">
      <div className="relative h-16 w-16">
        {top.map((photo, index) => (
          <div
            key={photo.id}
            className="absolute inset-0 overflow-hidden bg-white shadow-md"
            style={{
              transform: `rotate(${(index - 1) * 7}deg) translate(${index * 2}px, ${index * -2}px)`,
              border: `3px solid ${border}`,
              borderRadius: 3,
              zIndex: top.length - index,
            }}
          >
            <ScenicPhoto scene={photo.scene} className="h-full w-full" />
          </div>
        ))}
      </div>
      <span className="font-[family-name:var(--font-hand)] text-[20px] leading-none text-neutral-900">
        {cluster.photos.length}
      </span>
    </button>
  );
}
