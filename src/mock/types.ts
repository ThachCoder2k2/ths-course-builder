export type Level = 'beginner' | 'intermediate' | 'advanced';

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
}

export interface Resource {
  id: string;
  label: string;
  url: string;
  kind: 'pdf' | 'link' | 'file';
}

export interface Lesson {
  id: string;
  title: string;
  durationMin: number;
  videoUrl: string;
  isPreview: boolean;
  resources: Resource[];
  /**
   * When set, the lesson is a self-contained interactive HTML module served
   * from `public/` (its own board, chapters and progress). The learn page
   * embeds it full-bleed in place of the video player.
   */
  contentUrl?: string;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  courseIds: string[];
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  courseIds: string[];
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  lessonId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  coverImage: string;
  level: Level;
  durationHours: number;
  lessonCount: number;
  rating: number;
  enrolledCount: number;
  instructorId: string;
  topicIds: string[];
  learnPoints: string[];
  skills: string[];
  sections: Section[];
}
