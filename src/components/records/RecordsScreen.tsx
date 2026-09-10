"use client";

import { ScenicPhoto } from "@/components/map/ScenicPhoto";
import { useMap } from "@/context/map-context";
import { groupPhotosByMonth } from "@/lib/album";
import { hexByCategoryList, hexForCategory } from "@/lib/categories";
import { useMemo } from "react";

export function RecordsScreen() {
  const { albumPhotos, albumSort, setAlbumSort, openPhoto, keyCategories } = useMap();
  const groups = useMemo(() => groupPhotosByMonth(albumPhotos), [albumPhotos]);
  const hexById = useMemo(() => hexByCategoryList(keyCategories), [keyCategories]);

  return (
    <section className="relative flex min-h-0 flex-1 flex-col bg-white">
      <header className="flex items-end justify-between px-5 pt-5 pb-3">
        <div>
          <h1 className="font-[family-name:var(--font-hand)] text-2xl leading-none text-neutral-900">
            기록
          </h1>
          <p className="pt-1 text-[12px] text-neutral-500">촬영 날짜 순 · {albumPhotos.length}장</p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-neutral-200 text-[12px]">
          <SortChip active={albumSort === "desc"} onClick={() => setAlbumSort("desc")}>
            최신순
          </SortChip>
          <SortChip active={albumSort === "asc"} onClick={() => setAlbumSort("asc")}>
            오래된순
          </SortChip>
        </div>
      </header>

      {groups.length === 0 ? (
        <p className="px-8 pt-16 text-center text-sm text-neutral-500">아직 사진이 없어요.</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-28">
          {groups.map((group) => (
            <section key={group.key} className="pb-5">
              <h2 className="sticky top-0 z-10 bg-white/92 py-2 text-[13px] font-semibold text-neutral-800 backdrop-blur-sm">
                {group.label}
              </h2>
              <div className="grid grid-cols-3 gap-1.5">
                {group.photos.map((photo) => {
                  const hex = photo.category ? hexForCategory(photo.category, hexById) : null;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => openPhoto(photo.id)}
                      className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
                      aria-label={`${photo.title} · ${group.label}`}
                    >
                      <ScenicPhoto scene={photo.scene} className="h-full w-full" />
                      {hex ? (
                        <span
                          className="absolute right-1.5 bottom-1.5 size-2.5 rounded-full ring-2 ring-white/90"
                          style={{ backgroundColor: hex }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

function SortChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active ? "bg-neutral-900 px-2.5 py-1 text-white" : "bg-white px-2.5 py-1 text-neutral-600"
      }
    >
      {children}
    </button>
  );
}
