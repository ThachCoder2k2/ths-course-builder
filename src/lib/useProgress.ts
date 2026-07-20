import { useCallback, useEffect, useState } from 'react';
import {
  readProgress,
  writeProgress,
  progressPercent,
  type StoredProgress,
} from './progress';

export function useProgress(courseId: string) {
  const [state, setState] = useState<StoredProgress>(() => readProgress(courseId));

  useEffect(() => {
    setState(readProgress(courseId));
  }, [courseId]);

  const persist = useCallback(
    (next: StoredProgress) => {
      setState(next);
      writeProgress(courseId, next);
    },
    [courseId],
  );

  const isCompleted = useCallback(
    (lessonId: string) => state.completedLessonIds.includes(lessonId),
    [state],
  );

  const toggleComplete = useCallback(
    (lessonId: string) => {
      const done = state.completedLessonIds.includes(lessonId);
      persist({
        ...state,
        completedLessonIds: done
          ? state.completedLessonIds.filter((id) => id !== lessonId)
          : [...state.completedLessonIds, lessonId],
      });
    },
    [state, persist],
  );

  const markComplete = useCallback(
    (lessonId: string) => {
      if (state.completedLessonIds.includes(lessonId)) return;
      persist({ ...state, completedLessonIds: [...state.completedLessonIds, lessonId] });
    },
    [state, persist],
  );

  const setLast = useCallback(
    (lessonId: string) => {
      if (state.lastLessonId === lessonId) return;
      persist({ ...state, lastLessonId: lessonId });
    },
    [state, persist],
  );

  const percent = useCallback((total: number) => progressPercent(state, total), [state]);

  return { ...state, isCompleted, toggleComplete, markComplete, setLast, percent };
}
