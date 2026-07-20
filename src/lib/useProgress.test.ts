import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgress } from './useProgress';
import { readProgress, progressPercent, hasStarted } from './progress';

beforeEach(() => localStorage.clear());

describe('useProgress', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useProgress('c1'));
    expect(result.current.completedLessonIds).toEqual([]);
    expect(result.current.lastLessonId).toBeNull();
    expect(result.current.percent(3)).toBe(0);
  });

  it('toggles a lesson complete and persists to localStorage', () => {
    const { result } = renderHook(() => useProgress('c1'));
    act(() => result.current.toggleComplete('l1'));

    expect(result.current.isCompleted('l1')).toBe(true);
    expect(readProgress('c1').completedLessonIds).toContain('l1');
  });

  it('toggling twice removes the lesson', () => {
    const { result } = renderHook(() => useProgress('c1'));
    act(() => result.current.toggleComplete('l1'));
    act(() => result.current.toggleComplete('l1'));

    expect(result.current.isCompleted('l1')).toBe(false);
    expect(readProgress('c1').completedLessonIds).toEqual([]);
  });

  it('markComplete is idempotent', () => {
    const { result } = renderHook(() => useProgress('c1'));
    act(() => result.current.markComplete('l1'));
    act(() => result.current.markComplete('l1'));

    expect(result.current.completedLessonIds).toEqual(['l1']);
  });

  it('computes percent from total', () => {
    const { result } = renderHook(() => useProgress('c1'));
    act(() => result.current.markComplete('l1'));
    act(() => result.current.markComplete('l2'));

    expect(result.current.percent(4)).toBe(50);
  });

  it('records the last visited lesson', () => {
    const { result } = renderHook(() => useProgress('c1'));
    act(() => result.current.setLast('l3'));

    expect(result.current.lastLessonId).toBe('l3');
    expect(readProgress('c1').lastLessonId).toBe('l3');
  });

  it('keeps progress separate per course', () => {
    const { result: a } = renderHook(() => useProgress('c1'));
    act(() => a.current.markComplete('l1'));

    const { result: b } = renderHook(() => useProgress('c2'));
    expect(b.current.completedLessonIds).toEqual([]);
  });
});

describe('progress helpers', () => {
  it('percent guards against zero total', () => {
    expect(progressPercent({ completedLessonIds: ['l1'], lastLessonId: null }, 0)).toBe(0);
  });

  it('hasStarted reflects any activity', () => {
    expect(hasStarted({ completedLessonIds: [], lastLessonId: null })).toBe(false);
    expect(hasStarted({ completedLessonIds: [], lastLessonId: 'l1' })).toBe(true);
    expect(hasStarted({ completedLessonIds: ['l1'], lastLessonId: null })).toBe(true);
  });

  it('recovers from corrupt stored data', () => {
    localStorage.setItem('progress:cX', 'not json');
    expect(readProgress('cX')).toEqual({ completedLessonIds: [], lastLessonId: null });
  });
});
