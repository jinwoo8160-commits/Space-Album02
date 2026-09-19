"use client";

import { AddCategoryDialog, PhoneFrameModal } from "@/components/map/AddCategoryDialog";
import { useMap } from "@/context/map-context";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

const LONG_PRESS_MS = 520;

/**
 * 오른쪽 키컬러 핀.
 * 탭 = 필터, + = 새 카테고리, 터치 롱프레스 / 마우스 우클릭 = 삭제.
 * 새로 선택(ON)될 때만 핀 왼쪽에 이름이 Fade-in → 약 1.5초 뒤 Fade-out.
 * 선택 해제(OFF) 시에는 이름을 띄우지 않고, 떠 있던 이름이면 즉시 닫습니다.
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
  const [hint, setHint] = useState<{ id: string; key: number } | null>(null);
  const hintSeq = useRef(0);
  const deleting = keyCategories.find((item) => item.id === deleteId) ?? null;

  const showNameHint = (id: string) => {
    hintSeq.current += 1;
    setHint({ id, key: hintSeq.current });
  };

  const dismissNameHint = (id: string) => {
    setHint((current) => (current?.id === id ? null : current));
  };

  return (
    <div className="flex flex-col items-end gap-3 overflow-visible">
      {keyCategories.map((category) => {
        const active = selectedCategories.has(category.id);
        return (
          <CategoryPin
            key={category.id}
            label={category.name}
            color={category.hex}
            active={active}
            hintKey={hint?.id === category.id ? hint.key : null}
            onHintDone={(key) => {
              setHint((current) => (current?.key === key ? null : current));
            }}
            onToggle={() => {
              const turningOn = !selectedCategories.has(category.id);
              toggleCategory(category.id);
              if (turningOn) showNameHint(category.id);
              else dismissNameHint(category.id);
            }}
            onDelete={() => setDeleteId(category.id)}
          />
        );
      })}
      <button
        type="button"
        aria-label="새 카테고리 추가"
        onClick={() => setAddOpen(true)}
        className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
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
  hintKey,
  onHintDone,
  onToggle,
  onDelete,
}: {
  label: string;
  color: string;
  active: boolean;
  hintKey: number | null;
  onHintDone: (key: number) => void;
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
    <div className="flex h-9 items-center justify-end gap-2.5">
      {hintKey != null ? (
        <span
          key={hintKey}
          className={cn(
            "pin-name-hint pointer-events-none z-10 whitespace-nowrap rounded-full",
            "bg-white px-2.5 py-1 text-[12px] font-semibold tracking-tight text-neutral-900",
            "shadow-[0_4px_12px_rgba(0,0,0,0.16)]",
          )}
          onAnimationEnd={() => onHintDone(hintKey)}
        >
          {label}
        </span>
      ) : null}
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
        className="pointer-events-auto relative size-9 shrink-0 touch-manipulation rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.18)] select-none transition-transform"
        style={{
          backgroundColor: color,
          transform: active ? "scale(1.08)" : "scale(1)",
          boxShadow: active ? `0 0 0 3px white, 0 0 0 5px ${color}` : undefined,
          WebkitTouchCallout: "none",
        }}
      />
    </div>
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
