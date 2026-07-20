import img1 from '../../assets/courses/course-1.png';
import img2 from '../../assets/courses/course-2.png';
import img3 from '../../assets/courses/course-3.png';
import img4 from '../../assets/courses/course-4.png';
import img5 from '../../assets/courses/course-5.png';

// Source imagery exported from the Figma file (node 179:4442 and siblings).
const IMAGES = [img1, img2, img3, img4, img5];

/** Deterministic image per course so cards stay stable across renders. */
export function courseImage(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return IMAGES[hash % IMAGES.length];
}
