"use client";

import { CATEGORY_PRESET_HEX } from "@/lib/categories";
import { useMap } from "@/context/map-context";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const LONG_PRESS_MS = 520;

/**
 * 오른쪽 키컬러 핀.
 * 탭 = 필터, + = 새 카테고리, 터치 롱프레스 / 마우스 우클릭 = 삭제.
 */
export function ColorPinFilter() {
  const {
    selectedCategories,
    toggleCategory,
    keyCategories,
    addKeyCategory,
    removeKeyCategory,
  } = useMap();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleting = keyCategories.find((item) => item.id === deleteId) ?? null;

  return (
    <div className="flex flex-col items-center gap-3">
      {keyCategories.map((category) => {
        const active = selectedCategories.has(category.id);
        return (
          <CategoryPin
            key={category.id}
            label={category.name}
            color={category.hex}
            active={active}
            onToggle={() => toggleCategory(category.id)}
            onDelete={() => setDeleteId(category.id)}
          />
        );
      })}
      <button
        type="button"
        aria-label="새 카테고리 추가"
        onClick={() => setAddOpen(true)}
        className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
      >
        <Plus className="size-4" strokeWidth={3} />
      </button>

      {addOpen ? (
        <AddCategoryDialog
          onClose={() => setAddOpen(false)}
          onCreate={(name, hex) => {
            addKeyCategory(name, hex);
            setAddOpen(false);
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmDeleteDialog
          name={deleting.name}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            removeKeyCategory(deleting.id);
            setDeleteId(null);
          }}
        />
      ) : null}
    </div>
  );
}

function CategoryPin({
  label,
  color,
  active,
  onToggle,
  onDelete,
}: {
  label: string;
  color: string;
  active: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  const pressTimer = useRef<number | null>(null);
  const openedDelete = useRef(false);

  const clearPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const openDelete = () => {
    if (!onDelete) return;
    openedDelete.current = true;
    onDelete();
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${label} 필터`}
      onClick={() => {
        if (openedDelete.current) {
          openedDelete.current = false;
          return;
        }
        onToggle();
      }}
      onContextMenu={(event) => {
        if (!onDelete) return;
        event.preventDefault();
        openDelete();
      }}
      onPointerDown={(event) => {
        if (!onDelete) return;
        if (event.pointerType === "mouse") return;
        clearPress();
        pressTimer.current = window.setTimeout(() => {
          pressTimer.current = null;
          openDelete();
        }, LONG_PRESS_MS);
      }}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onPointerLeave={clearPress}
      className="relative size-9 touch-manipulation rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.18)] select-none transition-transform"
      style={{
        backgroundColor: color,
        transform: active ? "scale(1.08)" : "scale(1)",
        boxShadow: active ? `0 0 0 3px white, 0 0 0 5px ${color}` : undefined,
        WebkitTouchCallout: "none",
      }}
    />
  );
}

function PhoneFrameModal({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(document.getElementById("phone-frame"));
  }, []);

  if (!host) return null;

  return createPortal(
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/35 p-5">{children}</div>,
    host,
  );
}

function AddCategoryDialog({
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

function ConfirmDeleteDialog({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <PhoneFrameModal>
      <button type="button" className="absolute inset-0 cursor-default" aria-label="닫기" onClick={onCancel} />
      <div
        role="dialog"
        aria-labelledby="delete-category-title"
        className="relative z-10 w-full max-w-[260px] rounded-2xl bg-white p-4 shadow-2xl"
      >
        <p id="delete-category-title" className="text-[15px] font-semibold text-neutral-900">
          이 카테고리를 삭제하시겠습니까?
        </p>
        <p className="pt-2 text-[13px] text-neutral-500">
          {name}에 묶여 있던 사진은 미분류로 바뀌고, 도트 밀도도 다시 계산됩니다.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="px-3 py-1.5 text-[13px] text-neutral-500" onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className="rounded-full bg-neutral-900 px-3.5 py-1.5 text-[13px] text-white"
            onClick={onConfirm}
          >
            삭제
          </button>
        </div>
      </div>
    </PhoneFrameModal>
  );
}
