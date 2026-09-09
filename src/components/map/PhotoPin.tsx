"use client";

import { ScenicPhoto } from "@/components/map/ScenicPhoto";
import { hexByCategoryList, hexForCategory } from "@/lib/constants";
import { useMap } from "@/context/map-context";
import type { Photo } from "@/types/album";
import { useMemo } from "react";

export function PhotoPin({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  const { keyCategories } = useMap();
  const hexById = useMemo(() => hexByCategoryList(keyCategories), [keyCategories]);
  const border = hexForCategory(photo.category, hexById);

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
