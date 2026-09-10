"use client";

import { AddCategoryDialog, PhoneFrameModal } from "@/components/map/AddCategoryDialog";
import { useMap } from "@/context/map-context";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

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
