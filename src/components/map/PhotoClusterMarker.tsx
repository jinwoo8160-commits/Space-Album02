"use client";

import { ScenicPhoto } from "@/components/map/ScenicPhoto";
import { hexByCategoryList, hexForCategory } from "@/lib/constants";
import { useMap } from "@/context/map-context";
import type { PhotoCluster } from "@/types/album";
import { useMemo } from "react";

export function PhotoClusterMarker({
  cluster,
  onClick,
}: {
  cluster: PhotoCluster;
  onClick: () => void;
}) {
  const { keyCategories } = useMap();
  const hexById = useMemo(() => hexByCategoryList(keyCategories), [keyCategories]);
  const top = cluster.photos.slice(0, 3);
  const border = hexForCategory(top[0]?.category ?? null, hexById);

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
