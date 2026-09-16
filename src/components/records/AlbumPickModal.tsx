"use client";

import { AlbumScreen } from "@/components/album/AlbumScreen";
import { PhotoMetaDialog } from "@/components/records/PhotoMetaDialog";
import { useJournal } from "@/context/journal-context";
import type { Photo } from "@/types/album";
import { useEffect, useState } from "react";

export function AlbumPickModal({
  onCancel,
  onSelect,
  onToast,
  onAlert,
}: {
  onCancel: () => void;
  onSelect: (photo: Photo) => void;
  onToast: (message: string) => void;
  onAlert: (message: string) => void;
}) {
  const { setTabBarLocked } = useJournal();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [picked, setPicked] = useState<Photo | null>(null);
  const [metaPhoto, setMetaPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    setTabBarLocked(true);
    return () => setTabBarLocked(false);
  }, [setTabBarLocked]);

  const choose = (photo: Photo) => {
    if (pickedId && pickedId !== photo.id) {
      onToast("한 장의 사진만 선택해 주세요");
      return;
    }
    if (pickedId === photo.id) {
      setPickedId(null);
      setPicked(null);
      return;
    }
    setPickedId(photo.id);
    setPicked(photo);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between px-4 pt-4">
        <button
          type="button"
          className="rounded-full bg-[#ececee] px-4 py-1.5 text-[14px] text-neutral-700"
          onClick={onCancel}
        >
          취소
        </button>
        <button
          type="button"
          className="rounded-full bg-[#ececee] px-4 py-1.5 text-[14px] text-neutral-700"
          onClick={() => {
            if (!picked) {
              onAlert("사진을 선택해 주세요");
              return;
            }
            onSelect(picked);
          }}
        >
          선택
        </button>
      </div>
      <AlbumScreen
        variant="picker"
        selectedPhotoId={pickedId}
        onPickPhoto={choose}
        onNeedMeta={setMetaPhoto}
      />
      {metaPhoto ? (
        <PhotoMetaDialog
          photo={metaPhoto}
          onCancel={() => setMetaPhoto(null)}
          onConfirm={(photo) => {
            setMetaPhoto(null);
            choose(photo);
          }}
        />
      ) : null}
    </div>
  );
}
