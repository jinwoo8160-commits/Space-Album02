"use client";

import { PhoneFrameModal } from "@/components/map/AddCategoryDialog";
import { useEffect } from "react";

export function RecordToast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(timer);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[80] flex justify-center px-6">
      <p className="rounded-full bg-neutral-900/90 px-4 py-2 text-center text-[13px] text-white shadow-lg">
        {message}
      </p>
    </div>
  );
}

export function RecordAlert({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <PhoneFrameModal zClass="z-[85]">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="닫기" onClick={onClose} />
      <div role="dialog" className="relative z-10 w-full max-w-[260px] rounded-2xl bg-white px-5 py-5 text-center shadow-2xl">
        <p className="text-[14px] leading-relaxed text-neutral-800">{message}</p>
        <button
          type="button"
          className="mt-4 rounded-full bg-neutral-900 px-5 py-1.5 text-[13px] text-white"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </PhoneFrameModal>
  );
}
