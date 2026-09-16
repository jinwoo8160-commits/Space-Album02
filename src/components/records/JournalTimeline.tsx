"use client";

import { AlbumThumb } from "@/components/album/AlbumThumb";
import { useJournal } from "@/context/journal-context";
import { useMap } from "@/context/map-context";
import { canAddCourse, emptyCourse } from "@/lib/journal";
import { hexByCategoryList, hexForCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types/album";
import { JOURNAL_MAX_COURSES, type JournalCourse } from "@/types/journal";
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
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const PLACE_BOX_H = 28;
/** ~80% of the previous 10.75rem (172px) place pill. */
const PLACE_WIDTH = Math.round(10.75 * 16 * 0.8);
const TITLE_H = 40;
const SUBTITLE_H = 28;
const SUBTITLE_TO_TITLE = 8;
const ADD_SUBTITLE_H = 40;
const ADD_SUBTITLE_MB = 12;
const PLUS_BTN_PX = 44;
const ROW_PAD_Y = 12;
const PHOTO_MAX = 68;
const PHOTO_MIN = 44;
/** Compact default like the 1-course mock: do not stretch to fill the screen. */
const GAP_DEFAULT = 16;
/** Keeps edit-mode widget outlines from colliding. */
const GAP_MIN = 8;
/** Clearance above subtitle so share/collage buttons never collide at 5 courses. */
const SAFE_TOP = 56;
/** 10–15% micro-shrink of photo, place box, and padding when the list is full. */
const COMPACT_SCALE = 0.88;

const LONG_PRESS_MS = 520;

function rowHeight(photoSize: number, placeH: number, padY: number) {
  return Math.max(placeH, photoSize) + padY;
}

function useTimelineFit({
  courseCount,
  showPlus,
  subtitleVisible,
  showAddSubtitle,
}: {
  courseCount: number;
  showPlus: boolean;
  subtitleVisible: boolean;
  showAddSubtitle: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const atMax = courseCount >= JOURNAL_MAX_COURSES;
  const [photoSize, setPhotoSize] = useState(PHOTO_MAX);
  const [placeH, setPlaceH] = useState(PLACE_BOX_H);
  const [padY, setPadY] = useState(ROW_PAD_Y);
  const [gap, setGap] = useState(GAP_DEFAULT);
  const [safeTop, setSafeTop] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const apply = () => {
      const nextSafe = atMax ? SAFE_TOP : 0;
      setSafeTop(nextSafe);
      const available = el.clientHeight - nextSafe;
      const header =
        (showAddSubtitle ? ADD_SUBTITLE_H + ADD_SUBTITLE_MB : 0) +
        (subtitleVisible ? SUBTITLE_H + SUBTITLE_TO_TITLE : 0) +
        TITLE_H;
      const plus = showPlus ? PLUS_BTN_PX : 0;
      const n = Math.max(1, courseCount);
      const gapCount = 1 + (n - 1) + (showPlus ? 1 : 0);
      const scale = atMax ? COMPACT_SCALE : 1;
      const photoBase = PHOTO_MAX * scale;
      const placeBase = PLACE_BOX_H * scale;
      const padBase = ROW_PAD_Y * scale;
      const gapBase = atMax ? GAP_MIN : GAP_DEFAULT;

      const blockH = (photo: number, place: number, pad: number, nextGap: number) =>
        header + n * rowHeight(photo, place, pad) + plus + gapCount * nextGap;

      if (blockH(photoBase, placeBase, padBase, gapBase) <= available) {
        setPhotoSize(photoBase);
        setPlaceH(placeBase);
        setPadY(padBase);
        setGap(gapBase);
        return;
      }

      if (blockH(photoBase, placeBase, padBase, GAP_MIN) <= available) {
        const leftover = available - (header + n * rowHeight(photoBase, placeBase, padBase) + plus);
        setPhotoSize(photoBase);
        setPlaceH(placeBase);
        setPadY(padBase);
        setGap(Math.max(GAP_MIN, leftover / gapCount));
        return;
      }

      const leftover = available - header - plus - gapCount * GAP_MIN;
      const nextPhoto = Math.max(PHOTO_MIN, leftover / n - padBase);
      setPlaceH(placeBase);
      setPadY(padBase);
      setGap(GAP_MIN);
      setPhotoSize(Math.min(photoBase, nextPhoto));
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [atMax, courseCount, showPlus, subtitleVisible, showAddSubtitle]);

  return {
    containerRef,
    photoSize,
    placeH,
    padY,
    gap,
    safeTop,
    rowH: rowHeight(photoSize, placeH, padY),
  };
}

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
  size,
  onOpen,
}: {
  photo: Photo | null;
  hex: string | null;
  editing: boolean;
  size: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      disabled={editing}
      onClick={onOpen}
      className="relative shrink-0 overflow-hidden rounded-[18px] bg-white"
      style={{
        width: size,
        height: size,
        border: photo && hex ? `3px solid ${hex}` : "1.5px solid #171717",
      }}
      aria-label={photo ? "사진 변경" : "사진 추가"}
    >
      {photo ? (
        <AlbumThumb scene={photo.scene} className="h-full w-full" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-neutral-800">
          <ImageIcon className={size >= 56 ? "size-7" : "size-5"} strokeWidth={1.6} />
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
  photoSize,
  placeH,
  padY,
  rowH,
  onPlace,
  onPhoto,
  onDelete,
}: {
  course: JournalCourse;
  photo: Photo | undefined;
  hex: string | null;
  editing: boolean;
  canDelete: boolean;
  photoSize: number;
  placeH: number;
  padY: number;
  rowH: number;
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
      className={cn("relative shrink-0 px-5", sortable.isDragging && "opacity-90")}
      {...(editing ? { ...sortable.attributes, ...sortable.listeners } : {})}
    >
      <div
        {...(!editing ? bind : {})}
        className="relative mx-auto flex w-full max-w-[340px] shrink-0 items-center justify-between gap-2"
        style={{ height: rowH, paddingTop: padY / 2, paddingBottom: padY / 2 }}
      >
        <WidgetOutline show={editing} className="-inset-x-2 inset-y-0 rounded-[24px]" />
        <div className="flex min-w-0 flex-1 justify-end">
          <div
            className="box-border flex shrink-0 items-center justify-center rounded-full border border-neutral-800 px-2.5"
            style={{ height: placeH, width: PLACE_WIDTH }}
          >
            <HintField
              value={course.placeName}
              hint="장소명을 입력하세요"
              editing={editing}
              className="text-[12px]"
              onChange={onPlace}
            />
          </div>
        </div>
        <div className="relative w-8 shrink-0">
          <span className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900" />
        </div>
        <div className="flex min-w-0 flex-1 justify-start">
          <PhotoSlot
            photo={photo ?? null}
            hex={hex}
            editing={editing}
            size={photoSize}
            onOpen={onPhoto}
          />
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
  const showPlus = canAddCourse(draft.courses);
  const showAddSubtitle = editing && !draft.subtitleVisible;
  const { containerRef, photoSize, placeH, padY, gap, safeTop, rowH } = useTimelineFit({
    courseCount: count,
    showPlus,
    subtitleVisible: draft.subtitleVisible,
    showAddSubtitle,
  });

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
    <div
      ref={containerRef}
      className="flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden px-2"
      style={{ paddingTop: safeTop }}
    >
      <div className="flex w-full shrink-0 flex-col items-center">
        {showAddSubtitle ? (
          <button
            type="button"
            aria-label="부제 추가"
            className="mb-3 flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-neutral-800"
            onClick={() => setDraft((prev) => ({ ...prev, subtitleVisible: true, subtitle: "" }))}
          >
            <Plus className="size-5" strokeWidth={1.8} />
          </button>
        ) : null}

        {draft.subtitleVisible ? (
          <div
            className="relative w-full max-w-[260px] shrink-0 self-center"
            style={{ marginBottom: SUBTITLE_TO_TITLE }}
            {...(!editing ? bind : {})}
          >
            <WidgetOutline show={editing} className="-inset-x-3 -inset-y-2 rounded-[28px]" />
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

        <div className="relative w-full max-w-[300px] shrink-0 self-center" {...(!editing ? bind : {})}>
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

        <div className="relative w-full shrink-0">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 z-0 w-[2px] -translate-x-1/2 bg-neutral-900"
            style={{
              top: 0,
              bottom: showPlus ? PLUS_BTN_PX / 2 : rowH / 2,
            }}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={draft.courses.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div
                className="relative z-[2] flex w-full flex-col"
                style={{ gap, paddingTop: gap }}
              >
                {draft.courses.map((course) => {
                  const photo = course.photoId ? photoById.get(course.photoId) : undefined;
                  const hex = photo?.category ? hexForCategory(photo.category, hexById) : null;
                  return (
                    <SortableCourse
                      key={course.id}
                      course={course}
                      photo={photo}
                      hex={hex}
                      editing={editing}
                      canDelete={count > 1}
                      photoSize={photoSize}
                      placeH={placeH}
                      padY={padY}
                      rowH={rowH}
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
                  );
                })}
                {showPlus ? (
                  <div
                    className="relative z-[2] flex shrink-0 justify-center"
                    style={{ height: PLUS_BTN_PX }}
                  >
                    <button
                      type="button"
                      aria-label="코스 추가"
                      className="flex size-11 items-center justify-center rounded-[14px] border border-neutral-800 bg-white"
                      onClick={() => {
                        setDraft((prev) =>
                          canAddCourse(prev.courses)
                            ? { ...prev, courses: [...prev.courses, emptyCourse()] }
                            : prev,
                        );
                      }}
                    >
                      <Plus className="size-6" strokeWidth={1.7} />
                    </button>
                  </div>
                ) : null}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
