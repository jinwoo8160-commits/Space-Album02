"use client";

import { CATEGORY_PRESET_HEX } from "@/lib/categories";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function PhoneFrameModal({
  children,
  zClass = "z-[70]",
}: {
  children: ReactNode;
  zClass?: string;
}) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(document.getElementById("phone-frame"));
  }, []);

  if (!host) return null;

  return createPortal(
    <div className={`absolute inset-0 ${zClass} flex items-center justify-center bg-black/35 p-5`}>
      {children}
    </div>,
    host,
  );
}

/** 지도 필터와 사진 상세가 같이 쓰는 새 카테고리 컬러 픽커. */
export function AddCategoryDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, hex: string) => void;
}) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState<string | null>(null);
  const canCreate = hex !== null;

  return (
    <PhoneFrameModal>
      <button type="button" className="absolute inset-0 cursor-default" aria-label="닫기" onClick={onClose} />
      <div
        role="dialog"
        aria-labelledby="add-category-title"
        className="relative z-10 w-full max-w-[280px] rounded-2xl bg-white p-4 shadow-2xl"
      >
        <p id="add-category-title" className="text-[15px] font-semibold text-neutral-900">
          새 카테고리 추가
        </p>
        <p className="pt-1 text-[12px] text-neutral-500">이름과 키컬러를 고르면 오른쪽 패널에 바로 생깁니다.</p>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="카테고리 이름"
          autoFocus
          className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-[13px] outline-none focus:border-neutral-400"
        />
        <div className="mt-3 grid grid-cols-6 gap-2">
          {CATEGORY_PRESET_HEX.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={preset}
              aria-pressed={hex === preset}
              onClick={() => setHex(preset)}
              className="size-8 rounded-full"
              style={{
                backgroundColor: preset,
                boxShadow: hex === preset ? `0 0 0 2px white, 0 0 0 4px ${preset}` : "0 0 0 1px rgba(0,0,0,0.08)",
              }}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="px-3 py-1.5 text-[13px] text-neutral-500" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            disabled={!canCreate}
            className="rounded-full bg-neutral-900 px-3.5 py-1.5 text-[13px] text-white disabled:opacity-35"
            onClick={() => {
              if (!hex) return;
              onCreate(name, hex);
            }}
          >
            추가
          </button>
        </div>
      </div>
    </PhoneFrameModal>
  );
}
