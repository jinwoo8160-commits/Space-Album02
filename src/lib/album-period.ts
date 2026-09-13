import type { Photo } from "@/types/album";

export type AlbumRange = "year" | "month" | "week" | "day";

/** 남한 중심. 북한을 빼고 미니맵에 남한이 차게 보이게 합니다. */
export const ALBUM_SOUTH_CENTER: [number, number] = [127.8, 36.3];
export const ALBUM_OVERVIEW_ZOOM = 4.45;

export const ALBUM_RANGES: { id: AlbumRange; label: string }[] = [
  { id: "year", label: "년" },
  { id: "month", label: "월" },
  { id: "week", label: "주" },
  { id: "day", label: "일" },
];

export function weekOfMonth(date: Date): number {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + first.getDay()) / 7);
}

export function weekBounds(date: Date): { start: Date; end: Date } {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const week = weekOfMonth(date);
  const startDay = (week - 1) * 7 - first.getDay() + 1;
  const start = new Date(date.getFullYear(), date.getMonth(), startDay, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), startDay + 6, 23, 59, 59, 999);
  return { start, end };
}

export function formatPeriodLabel(range: AlbumRange, cursor: Date): string {
  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const day = cursor.getDate();
  if (range === "year") return `${year}년`;
  if (range === "month") return `${year}년 ${month}월`;
  if (range === "week") return `${year}년 ${month}월 ${weekOfMonth(cursor)}주차`;
  return `${year}년 ${month}월 ${day}일`;
}

export function shiftPeriod(cursor: Date, range: AlbumRange, delta: number): Date {
  const next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 12, 0, 0);
  if (range === "year") next.setFullYear(next.getFullYear() + delta);
  else if (range === "month") next.setMonth(next.getMonth() + delta);
  else if (range === "week") next.setDate(next.getDate() + delta * 7);
  else next.setDate(next.getDate() + delta);
  return next;
}

export function photoInPeriod(photo: Photo, range: AlbumRange, cursor: Date): boolean {
  const taken = new Date(photo.takenAt);
  if (Number.isNaN(taken.getTime())) return false;
  if (range === "year") return taken.getFullYear() === cursor.getFullYear();
  if (range === "month") {
    return taken.getFullYear() === cursor.getFullYear() && taken.getMonth() === cursor.getMonth();
  }
  if (range === "day") {
    return (
      taken.getFullYear() === cursor.getFullYear() &&
      taken.getMonth() === cursor.getMonth() &&
      taken.getDate() === cursor.getDate()
    );
  }
  const { start, end } = weekBounds(cursor);
  return taken >= start && taken <= end;
}

export function photosInPeriod(photos: Photo[], range: AlbumRange, cursor: Date): Photo[] {
  return photos.filter((photo) => photoInPeriod(photo, range, cursor));
}
