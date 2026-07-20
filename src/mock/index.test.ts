import { describe, it, expect } from 'vitest';
import {
  getCourses,
  getCourseBySlug,
  getCoursesByLevel,
  getTopicBySlug,
  getCoursesByTopic,
  getRelatedCourses,
  flattenLessons,
  getLesson,
  searchCourses,
  getCommentsByLesson,
  sectionDurationMin,
} from './index';

describe('mock accessors', () => {
  it('returns all courses', () => {
    expect(getCourses().length).toBeGreaterThanOrEqual(8);
  });

  it('finds a course by slug', () => {
    expect(getCourseBySlug('ai-co-ban-den-thuc-tien')?.title).toContain('Trí tuệ nhân tạo');
  });

  it('returns undefined for unknown slug', () => {
    expect(getCourseBySlug('nope')).toBeUndefined();
  });

  it('filters by level', () => {
    const beginners = getCoursesByLevel('beginner');
    expect(beginners.length).toBeGreaterThan(0);
    beginners.forEach((c) => expect(c.level).toBe('beginner'));
  });

  it('finds topic by slug and its courses', () => {
    const t = getTopicBySlug('tri-tue-nhan-tao');
    expect(t).toBeDefined();
    expect(getCoursesByTopic(t!.id).length).toBeGreaterThan(0);
  });

  it('excludes self from related courses', () => {
    const c = getCourseBySlug('ai-co-ban-den-thuc-tien')!;
    const related = getRelatedCourses(c.id);
    expect(related.length).toBeGreaterThan(0);
    expect(related.some((r) => r.id === c.id)).toBe(false);
  });

  it('flattens lessons in order', () => {
    const c = getCourseBySlug('ai-co-ban-den-thuc-tien')!;
    const flat = flattenLessons(c);
    expect(flat[0].lesson.id).toBe('l1');
    expect(flat.length).toBe(c.sections.reduce((n, s) => n + s.lessons.length, 0));
    expect(flat.map((f) => f.index)).toEqual(flat.map((_, i) => i));
  });

  it('course lessonCount matches actual lessons for the primary course', () => {
    const c = getCourseBySlug('ai-co-ban-den-thuc-tien')!;
    expect(flattenLessons(c).length).toBe(c.lessonCount);
  });

  it('gets a lesson by course slug + lesson id', () => {
    expect(getLesson('ai-co-ban-den-thuc-tien', 'l1')?.lesson.title).toBe('AI là gì?');
    expect(getLesson('ai-co-ban-den-thuc-tien', 'missing')).toBeUndefined();
  });

  it('searches courses by title (case-insensitive)', () => {
    expect(searchCourses('trí tuệ').length).toBeGreaterThan(0);
    expect(searchCourses('TRÍ TUỆ').length).toBe(searchCourses('trí tuệ').length);
    expect(searchCourses('  ').length).toBe(getCourses().length);
  });

  it('returns comments for a lesson', () => {
    const list = getCommentsByLesson('l1');
    expect(list.length).toBeGreaterThan(0);
    list.forEach((c) => expect(c.lessonId).toBe('l1'));
  });

  it('sums section duration', () => {
    const c = getCourseBySlug('ai-co-ban-den-thuc-tien')!;
    expect(sectionDurationMin(c.sections[0])).toBe(8 + 11 + 9);
  });

  it('every course has at least one section with lessons', () => {
    getCourses().forEach((c) => {
      expect(c.sections.length).toBeGreaterThan(0);
      expect(flattenLessons(c).length).toBeGreaterThan(0);
    });
  });
});
