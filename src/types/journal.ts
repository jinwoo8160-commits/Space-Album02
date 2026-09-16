export type JournalCourse = {
  id: string;
  placeName: string;
  photoId: string | null;
};

export type JournalDraft = {
  title: string;
  subtitle: string;
  subtitleVisible: boolean;
  courses: JournalCourse[];
};

export const JOURNAL_MAX_COURSES = 5;
