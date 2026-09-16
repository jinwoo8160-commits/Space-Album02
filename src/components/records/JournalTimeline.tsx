"use client";

import { AlbumThumb } from "@/components/album/AlbumThumb";
import { useJournal } from "@/context/journal-context";
import { useMap } from "@/context/map-context";
import { canAddCourse, emptyCourse } from "@/lib/journal";
import { hexByCategoryList, hexForCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types/album";
import type { JournalCourse } from "@/types/journal";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Image as ImageIcon, Minus, Plus } from "lucide-react";
import { useMemo, useRef, type PointerEvent as ReactPointerEvent } from "react";

const LONG_PRESS_MS = 520;

function useEnterEdit() {
  const { editing, setEditing } = useJournal();
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return {
    editing,
    bind: {
      onPointerDown: (event: ReactPointerEvent) => {
        if (editing || event.button === 2) return;
        clear();
        timer.current = window.setTimeout(() => setEditing(true), LONG_PRESS_MS);
      },
      onPointerUp: clear,
      onPointerCancel: clear,
      onPointerLeave: clear,
      onContextMenu: (event: { preventDefault: () => void }) => {
        event.preventDefault();
        setEditing(true);
      },
    },
  };
}

function WidgetOutline({ show, className }: { show: boolean; className?: string }) {
  if (!show) return null;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute border border-neutral-800", className)}
    />
  );
}

function HintField({
  value,
  hint,
  editing,
  className,
  onChange,
}: {
  value: string;
  hint: string;
  editing: boolean;
  className?: string;
  onChange: (next: string) => void;
}) {
  return (
    <input
      value={value}
      readOnly={editing}
      tabIndex={editing ? -1 : 0}
      placeholder={hint}
      onFocus={(event) => {
        if (editing) return;
        event.currentTarget.placeholder = "";
      }}
      onBlur={(event) => {
        event.currentTarget.placeholder = hint;
      }}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-full w-full appearance-none border-0 bg-transparent p-0 text-center outline-none placeholder:text-neutral-400",
        "overflow-hidden whitespace-nowrap",
        editing && "pointer-events-none",
        className,
      )}
    />
  );
}

function PhotoSlot({
  photo,
  hex,
  editing,
  onOpen,
}: {
  photo: Photo | null;
  hex: string | null;
  editing: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      disabled={editing}
      onClick={onOpen}
      className="relative size-[68px] shrink-0 overflow-hidden rounded-[18px] bg-white"
      style={{
        border: photo && hex ? `3px solid ${hex}` : "1.5px solid #171717",
      }}
      aria-label={photo ? "사진 변경" : "사진 추가"}
    >
      {photo ? (
        <AlbumThumb scene={photo.scene} className="h-full w-full" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-neutral-800">
          <ImageIcon className="size-7" strokeWidth={1.6} />
        </span>
      )}
    </button>
  );
}

function SortableCourse({
  course,
  photo,
  hex,
  editing,
  canDelete,
  onPlace,
  onPhoto,
  onDelete,
}: {
  course: JournalCourse;
  photo: Photo | undefined;
  hex: string | null;
  editing: boolean;
  canDelete: boolean;
  onPlace: (value: string) => void;
  onPhoto: () => void;
  onDelete: () => void;
}) {
  const { bind } = useEnterEdit();
  const sortable = useSortable({ id: course.id, disabled: !editing || !canDelete });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    zIndex: sortable.isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={cn("relative px-5", sortable.isDragging && "opacity-90")}
      {...(editing ? { ...sortable.attributes, ...sortable.listeners } : {})}
    >
      <div
        {...(!editing ? bind : {})}
        className="relative mx-auto flex w-full max-w-[340px] items-center justify-between gap-2 py-1.5"
      >
        <WidgetOutline
          show={editing}
          className="-inset-x-2 inset-y-0 rounded-[24px]"
        />
        <div className="flex min-w-0 flex-1 justify-end">
          <div className="box-border flex h-7 w-[10.75rem] items-center justify-center rounded-full border border-neutral-800 px-3">
            <HintField
              value={course.placeName}
              hint="장소명을 입력하세요"
              editing={editing}
              className="text-[12px] leading-[28px]"
              onChange={onPlace}
            />
          </div>
        </div>
        <div className="w-8 shrink-0" />
        <div className="flex min-w-0 flex-1 justify-start">
          <PhotoSlot photo={photo ?? null} hex={hex} editing={editing} onOpen={onPhoto} />
        </div>
        {editing && canDelete ? (
          <button
            type="button"
            aria-label="코스 삭제"
            className="absolute top-1/2 -right-1 flex size-7 -translate-y-1/2 translate-x-full items-center justify-center rounded-full bg-neutral-300 text-white"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onDelete}
          >
            <Minus className="size-4" strokeWidth={2.4} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function JournalTimeline({
  onPickPhoto,
}: {
  onPickPhoto: (courseId: string) => void;
}) {
  const { draft, setDraft, editing } = useJournal();
  const { photos, keyCategories } = useMap();
  const hexById = useMemo(() => hexByCategoryList(keyCategories), [keyCategories]);
  const { bind } = useEnterEdit();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const photoById = useMemo(() => new Map(photos.map((photo) => [photo.id, photo])), [photos]);
  const count = draft.courses.length;
  const rowPx = 92;
  const lineTop = 8;
  const lineHeight = Math.max(24, (count - 1) * rowPx + 36);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDraft((prev) => {
      const oldIndex = prev.courses.findIndex((item) => item.id === active.id);
      const newIndex = prev.courses.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return { ...prev, courses: arrayMove(prev.courses, oldIndex, newIndex) };
    });
  };

  return (
    <div className="flex flex-col items-center px-2 pb-8 pt-6">
      {editing && !draft.subtitleVisible ? (
        <button
          type="button"
          aria-label="부제 추가"
          className="mb-4 flex size-10 items-center justify-center rounded-[12px] border border-neutral-800"
          onClick={() => setDraft((prev) => ({ ...prev, subtitleVisible: true, subtitle: "" }))}
        >
          <Plus className="size-5" strokeWidth={1.8} />
        </button>
      ) : null}

      {draft.subtitleVisible ? (
        <div className="relative mb-2.5 w-full max-w-[260px]" {...(!editing ? bind : {})}>
          <WidgetOutline
            show={editing}
            className="-inset-x-3 -inset-y-2 rounded-[28px]"
          />
          <div className="box-border flex h-7 w-full items-center justify-center rounded-full border border-neutral-800 px-4">
            <HintField
              value={draft.subtitle}
              hint="부제를 입력하세요"
              editing={editing}
              className="text-[13px] leading-[28px]"
              onChange={(subtitle) => setDraft((prev) => ({ ...prev, subtitle }))}
            />
          </div>
          {editing ? (
            <button
              type="button"
              aria-label="부제 삭제"
              className="absolute top-1/2 -right-1 flex size-7 -translate-y-1/2 translate-x-full items-center justify-center rounded-full bg-neutral-300 text-white"
              onClick={() => setDraft((prev) => ({ ...prev, subtitleVisible: false, subtitle: "" }))}
            >
              <Minus className="size-4" strokeWidth={2.4} />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="relative mb-4 w-full max-w-[300px]" {...(!editing ? bind : {})}>
        <div className="box-border flex h-10 w-full items-center justify-center rounded-[22px] border border-neutral-800 px-4">
          <HintField
            value={draft.title}
            hint="제목을 입력하세요"
            editing={editing}
            className={cn(
              "text-[18px] leading-[40px] font-medium",
              draft.title.trim() && "text-[22px] font-bold",
            )}
            onChange={(title) => setDraft((prev) => ({ ...prev, title }))}
          />
        </div>
      </div>

      <div className="relative w-full">
        <div
          className="pointer-events-none absolute left-1/2 z-0 w-px -translate-x-1/2 bg-neutral-900"
          style={{ top: lineTop, height: lineHeight }}
        />
        {draft.courses.map((_, index) => (
          <span
            key={`dot-${index}`}
            className="pointer-events-none absolute left-1/2 z-[1] size-2.5 -translate-x-1/2 rounded-full bg-neutral-900"
            style={{ top: lineTop + index * rowPx + 34 }}
          />
        ))}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={draft.courses.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="relative z-[2] flex flex-col" style={{ gap: 0 }}>
              {draft.courses.map((course) => {
                const photo = course.photoId ? photoById.get(course.photoId) : undefined;
                const hex = photo?.category ? hexForCategory(photo.category, hexById) : null;
                return (
                  <div key={course.id} style={{ height: rowPx }} className="flex items-center">
                    <div className="w-full">
                      <SortableCourse
                        course={course}
                        photo={photo}
                        hex={hex}
                        editing={editing}
                        canDelete={count > 1}
                        onPlace={(placeName) =>
                          setDraft((prev) => ({
                            ...prev,
                            courses: prev.courses.map((item) =>
                              item.id === course.id ? { ...item, placeName } : item,
                            ),
                          }))
                        }
                        onPhoto={() => {
                          if (!editing) onPickPhoto(course.id);
                        }}
                        onDelete={() => {
                          if (count <= 1) return;
                          setDraft((prev) => ({
                            ...prev,
                            courses: prev.courses.filter((item) => item.id !== course.id),
                          }));
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {canAddCourse(draft.courses) ? (
          <div className="relative z-[2] mt-1 flex justify-center">
            <button
              type="button"
              aria-label="코스 추가"
              className="flex size-11 items-center justify-center rounded-[14px] border border-neutral-800 bg-white"
              onClick={() => {
                setDraft((prev) =>
                  canAddCourse(prev.courses) ? { ...prev, courses: [...prev.courses, emptyCourse()] } : prev,
                );
              }}
            >
              <Plus className="size-6" strokeWidth={1.7} />
            </button>
          </div>
        ) : null}
      </div>

    </div>
  );
}
