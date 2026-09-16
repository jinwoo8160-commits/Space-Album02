"use client";

import { AlbumPickModal } from "@/components/records/AlbumPickModal";
import { JournalTimeline } from "@/components/records/JournalTimeline";
import { RecordAlert, RecordToast } from "@/components/records/RecordFeedback";
import { useJournal } from "@/context/journal-context";
import { journalShareBlocker } from "@/lib/journal";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types/album";
import { toPng } from "html-to-image";
import { LayoutGrid, Upload } from "lucide-react";
import { useRef, useState } from "react";

export function RecordScreen() {
  const { draft, setDraft, editing, setEditing } = useJournal();
  const captureRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [pickCourseId, setPickCourseId] = useState<string | null>(null);
  const sharing = useRef(false);

  const applyPhoto = (photo: Photo) => {
    if (!pickCourseId) return;
    setDraft((prev) => ({
      ...prev,
      courses: prev.courses.map((item) =>
        item.id === pickCourseId
          ? {
              ...item,
              photoId: photo.id,
            }
          : item,
      ),
    }));
    setPickCourseId(null);
  };

  const share = async () => {
    if (editing || sharing.current) return;
    const missing = journalShareBlocker(draft);
    if (missing) {
      setAlert(missing);
      return;
    }
    const node = captureRef.current;
    if (!node) return;
    sharing.current = true;
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "시공간-기록.png", { type: "image/png" });
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } catch {
        /* 클립보드 권한이 없으면 다운로드만 합니다. */
      }
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = file.name;
      link.click();
    } catch {
      setAlert("화면을 저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      sharing.current = false;
    }
  };

  return (
    <section className="relative flex h-full max-h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-4">
        <div className="pointer-events-auto min-w-[72px]">
          {editing ? (
            <button
              type="button"
              className="rounded-full bg-[#ececee] px-4 py-1.5 text-[14px] text-neutral-700"
              onClick={() => setEditing(false)}
            >
              확인
            </button>
          ) : null}
        </div>
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <button
            type="button"
            aria-label="공유"
            disabled={editing}
            onClick={() => void share()}
            className={cn(
              "flex size-11 items-center justify-center rounded-full border border-neutral-800 bg-white",
              editing && "opacity-35",
            )}
          >
            <Upload className="size-5" strokeWidth={1.7} />
          </button>
          <button
            type="button"
            aria-label="콜라주"
            disabled={editing}
            onClick={() => setToast("기능 준비 중입니다")}
            className={cn(
              "flex size-11 items-center justify-center rounded-full border border-neutral-800 bg-white",
              editing && "opacity-35",
            )}
          >
            <LayoutGrid className="size-5" strokeWidth={1.7} />
          </button>
        </div>
      </header>

      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden pb-[5.75rem]">
        <div ref={captureRef} className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <JournalTimeline onPickPhoto={setPickCourseId} />
        </div>
      </div>

      {pickCourseId ? (
        <AlbumPickModal
          onCancel={() => setPickCourseId(null)}
          onSelect={applyPhoto}
          onToast={setToast}
          onAlert={setAlert}
        />
      ) : null}

      <RecordToast message={toast} onDone={() => setToast(null)} />
      <RecordAlert message={alert} onClose={() => setAlert(null)} />
    </section>
  );
}
