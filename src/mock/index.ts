import { courses, topics, instructors, user, collections, comments } from './data';
import type { Course, Level, Topic, Lesson, Section } from './types';

export function getCourses(): Course[] {
  return courses;
}

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getCoursesByLevel(level: Level): Course[] {
  return courses.filter((c) => c.level === level);
}

export function getFeaturedCourses(n = 4): Course[] {
  return [...courses].sort((a, b) => b.rating - a.rating).slice(0, n);
}

export function getTopics(): Topic[] {
  return topics;
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function getCoursesByTopic(topicId: string): Course[] {
  return courses.filter((c) => c.topicIds.includes(topicId));
}

export function getRelatedCourses(courseId: string, n = 3): Course[] {
  const self = getCourseById(courseId);
  if (!self) return [];
  return courses
    .filter((c) => c.id !== courseId && c.topicIds.some((t) => self.topicIds.includes(t)))
    .slice(0, n);
}

export function getInstructor(id: string) {
  return instructors.find((i) => i.id === id);
}

export function getUser() {
  return user;
}

export function getCollections() {
  return collections;
}

export function getCommentsByLesson(lessonId: string) {
  return comments.filter((c) => c.lessonId === lessonId);
}

export interface FlatLesson {
  section: Section;
  lesson: Lesson;
  index: number;
}

export function flattenLessons(course: Course): FlatLesson[] {
  const out: FlatLesson[] = [];
  let i = 0;
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      out.push({ section, lesson, index: i });
      i += 1;
    }
  }
  return out;
}

export function getLesson(courseSlug: string, lessonId: string): FlatLesson | undefined {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;
  return flattenLessons(course).find((f) => f.lesson.id === lessonId);
}

export function searchCourses(q: string): Course[] {
  const s = q.trim().toLowerCase();
  if (!s) return courses;
  return courses.filter(
    (c) => c.title.toLowerCase().includes(s) || c.subtitle.toLowerCase().includes(s),
  );
}

export function sectionDurationMin(section: Section): number {
  return section.lessons.reduce((n, l) => n + l.durationMin, 0);
}

export type { Course, Level, Topic, Lesson, Section };

/** Total runtime of a course, summed from its lessons. */
export function courseMinutes(course: Course): number {
  return flattenLessons(course).reduce((n, f) => n + f.lesson.durationMin, 0);
}

/** Mock experience points; Figma shows an "exp" badge but carries no such field. */
export function courseExp(course: Course): number {
  return course.lessonCount * 100;
}
