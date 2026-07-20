export interface StoredProgress {
  completedLessonIds: string[];
  lastLessonId: string | null;
}

export const EMPTY_PROGRESS: StoredProgress = { completedLessonIds: [], lastLessonId: null };

export function progressKey(courseId: string) {
  return 'progress:' + courseId;
}

export function readProgress(courseId: string): StoredProgress {
  try {
    const raw = localStorage.getItem(progressKey(courseId));
    if (!raw) return { ...EMPTY_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
      lastLessonId: typeof parsed.lastLessonId === 'string' ? parsed.lastLessonId : null,
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function writeProgress(courseId: string, next: StoredProgress) {
  try {
    localStorage.setItem(progressKey(courseId), JSON.stringify(next));
  } catch {
    // storage unavailable (private mode / quota) - progress is best-effort in this mock
  }
}

export function progressPercent(progress: StoredProgress, totalLessons: number) {
  if (totalLessons <= 0) return 0;
  return Math.round((progress.completedLessonIds.length / totalLessons) * 100);
}

export function hasStarted(progress: StoredProgress) {
  return progress.completedLessonIds.length > 0 || progress.lastLessonId !== null;
}
