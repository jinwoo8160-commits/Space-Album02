"use client";

import { PhoneFrameModal } from "@/components/map/AddCategoryDialog";
import { useMap } from "@/context/map-context";
import { KOREA_PLACE_OPTIONS } from "@/data/mock-photos";
import { hexByCategoryList } from "@/lib/categories";
import type { Photo } from "@/types/album";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

export function PhotoMetaDialog({
  photo,
  onCancel,
  onConfirm,
}: {
  photo: Photo;
  onCancel: () => void;
  onConfirm: (photo: Photo) => void;
}) {
  const { keyCategories, updatePhoto } = useMap();
  const hexById = useMemo(() => hexByCategoryList(keyCategories), [keyCategories]);
  const needCategory = !photo.category;
  const needLocation = photo.hasGps === false;
  const [category, setCategory] = useState(photo.category);
  const [placeName, setPlaceName] = useState(
    photo.hasGps === false ? "" : photo.locationLabel,
  );
  const [placeId, setPlaceId] = useState(KOREA_PLACE_OPTIONS[0]?.id ?? "");

  const canSubmit = (!needCategory || Boolean(category)) && (!needLocation || Boolean(placeId));

  const submit = () => {
    if (!canSubmit) return;
    const hub = KOREA_PLACE_OPTIONS.find((item) => item.id === placeId);
    const patch: Partial<Photo> = {};
    if (needCategory && category) patch.category = category;
    if (needLocation && hub) {
      patch.hasGps = true;
      patch.lat = hub.lat;
      patch.lng = hub.lng;
      patch.locationLabel = placeName.trim() || hub.locationLabel;
      patch.districtLabel = hub.districtLabel;
      patch.provinceId = hub.provinceId;
      patch.countryId = "kr";
    }
    updatePhoto(photo.id, patch);
    onConfirm({ ...photo, ...patch });
  };

  return (
    <PhoneFrameModal zClass="z-[90]">
      <div role="dialog" className="relative z-10 w-full max-w-[300px] rounded-2xl bg-white p-4 shadow-2xl">
        <button
          type="button"
          aria-label="닫기"
          className="absolute top-3 right-3 flex size-7 items-center justify-center text-neutral-400"
          onClick={onCancel}
        >
          <X className="size-4" />
        </button>
        <p className="pr-8 text-[15px] font-semibold text-neutral-900">카테고리 및 위치를 선택해 주세요</p>
        <p className="pt-1 text-[12px] text-neutral-500">선택 앨범에 올리려면 키컬러와 장소가 필요합니다.</p>

        {needCategory ? (
          <div className="mt-3">
            <p className="text-[12px] font-medium text-neutral-600">카테고리</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {keyCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.name}
                  aria-pressed={category === item.id}
                  onClick={() => setCategory(item.id)}
                  className="size-8 rounded-full"
                  style={{
                    backgroundColor: hexById[item.id] ?? item.hex,
                    boxShadow:
                      category === item.id
                        ? `0 0 0 2px white, 0 0 0 4px ${item.hex}`
                        : "0 0 0 1px rgba(0,0,0,0.08)",
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {needLocation ? (
          <div className="mt-3 space-y-2">
            <p className="text-[12px] font-medium text-neutral-600">위치</p>
            <input
              value={placeName}
              onChange={(event) => setPlaceName(event.target.value)}
              placeholder="장소명을 입력하세요"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-[13px] outline-none focus:border-neutral-400"
            />
            <select
              value={placeId}
              onChange={(event) => setPlaceId(event.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] outline-none"
            >
              {KOREA_PLACE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.locationLabel}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <button
          type="button"
          disabled={!canSubmit}
          className="mt-4 w-full rounded-full bg-neutral-900 py-2 text-[13px] text-white disabled:opacity-35"
          onClick={submit}
        >
          확인
        </button>
      </div>
    </PhoneFrameModal>
  );
}
