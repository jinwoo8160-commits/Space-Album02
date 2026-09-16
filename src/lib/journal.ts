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
