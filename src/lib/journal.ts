import { objectParticle } from "@/lib/korean";
import { JOURNAL_MAX_COURSES, type JournalCourse, type JournalDraft } from "@/types/journal";

export function newCourseId() {
  return `course-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyCourse(): JournalCourse {
  return { id: newCourseId(), placeName: "", photoId: null };
}

export function emptyJournal(): JournalDraft {
  return {
    title: "",
    subtitle: "",
    subtitleVisible: true,
    courses: [emptyCourse()],
  };
}

export function canAddCourse(courses: JournalCourse[]) {
  return courses.length < JOURNAL_MAX_COURSES;
}

export function photoNeedsMeta(photo: { category: string | null; hasGps?: boolean }) {
  return !photo.category || photo.hasGps === false;
}

export function journalShareBlocker(draft: JournalDraft): string | null {
  if (draft.subtitleVisible && !draft.subtitle.trim()) {
    return `부제${objectParticle("부제")} 입력해 주세요`;
  }
  if (!draft.title.trim()) return `제목${objectParticle("제목")} 입력해 주세요`;
  if (draft.courses.some((item) => !item.placeName.trim())) {
    return `장소명${objectParticle("장소명")} 입력해 주세요`;
  }
  if (draft.courses.some((item) => !item.photoId)) return "사진을 업로드해 주세요";
  return null;
}
