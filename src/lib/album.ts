import type { Photo } from "@/types/album";

export type AlbumSort = "desc" | "asc";

export function sortPhotosByTakenAt(photos: Photo[], sort: AlbumSort): Photo[] {
  return [...photos].sort((a, b) => {
    const delta = new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime();
    if (delta !== 0) return sort === "desc" ? -delta : delta;
    return sort === "desc" ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
  });
}

export type MonthGroup = {
  key: string;
  label: string;
  photos: Photo[];
};

/** 이미 정렬된 배열을 연·월 헤더로 묶습니다. */
export function groupPhotosByMonth(photos: Photo[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const photo of photos) {
    const date = new Date(photo.takenAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.photos.push(photo);
    } else {
      groups.push({
        key,
        label: `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
        photos: [photo],
      });
    }
  }
  return groups;
}

export function formatTakenAt(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}
