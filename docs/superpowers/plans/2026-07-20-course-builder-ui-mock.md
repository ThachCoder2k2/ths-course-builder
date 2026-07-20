# Course Builder UI (Mock) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a UI-only, fully-responsive React web app that reproduces the 4 Figma screens (Dashboard, Topic, Course Detail, Lesson Player) of the THS / GK EBOOKS course platform, driven entirely by typed mock data, so the team can click through the real flow before any backend exists.

**Architecture:** Route-driven feature modules (Approach A). `routes/` holds one page per URL, `components/{layout,ui,course,learn,home}/` holds custom presentational + interactive components, `mock/` is a typed data layer behind accessor functions (swap to real API later = change one layer), and all Figma design decisions live as tokens in `tailwind.config.ts` + CSS variables (single source of truth). Learner progress persists to `localStorage` so the prototype feels stateful.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, `react-router-dom` v6, `clsx` + `tailwind-merge` (class helper), `lucide-react` (generic UI icons only — chevrons/play/etc.; brand illustrations are exported Figma assets), Vitest + React Testing Library (logic/interaction tests).

---

## Testing Philosophy (read before starting)

This is a visual UI mock. Applying full TDD to a presentational `<div>` is bad test design. So:

- **TDD (test-first)** for logic-bearing units: mock accessors, `useProgress` (localStorage), interactive primitives (`Tabs`, `Accordion`), the `VideoPlayer` control logic, dashboard/topic **filter + search**, and **route rendering**.
- **Build + visual-verify** for pure presentational components: write the real component (full code, real token classes), render it in the running app, eyeball against the Figma frame, commit. No forced unit test.

Every task still ends in a **commit**.

---

## ⚠️ Figma Access Dependency (blocks high-fidelity, not scaffolding)

Fidelity target = **high, exact from Figma Dev Mode**. Tasks 0–3 (scaffold, tokens skeleton, mock data, routing) do **not** need Figma. Task 1 (finalize tokens) and every screen task need exact values + exported assets. Before executing Task 1, get one of these working:

1. **Auth the `figma` MCP** — run `/mcp` → figma → Authenticate. Then pull node styles + export assets via MCP. *(Server is added but currently `Needs authentication`.)*
2. **Chrome dev-mode inspection** — user is logged into Figma in Chrome; inspect nodes at the Dev Mode URL, read the CSS panel per node.
3. **Manual export** — user exports assets (SVG/PNG) into `src/assets/`, provides token values.

Figma file: `https://www.figma.com/design/TB2dDlsgmJ6GDdCY6E47gQ/Cource-builder--Copy-` (Dev Mode, `m=dev`).
Note: Dev Mode may require a Dev/Full seat; the account's Professional plan is flagged for downgrade in ~13 days — confirm seat before relying on option 1/2.

The token values in Task 1 below are **eyeballed starting defaults** (runnable, not placeholders). Task 1's final step is to **refine them against Dev Mode**.

---

## File Structure

```
course-builder/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ tsconfig.node.json
├─ tailwind.config.ts          # Figma design tokens (colors/type/spacing/radii/shadow)
├─ postcss.config.js
├─ vitest.config.ts
├─ vitest.setup.ts
├─ .gitignore
├─ README.md
├─ public/
│  └─ media/sample-lesson.mp4   # open-source sample clip
└─ src/
   ├─ main.tsx                  # React root + Router
   ├─ App.tsx                   # <Routes>
   ├─ styles/globals.css        # Tailwind layers + CSS vars + font
   ├─ lib/
   │  ├─ cn.ts                  # clsx+twMerge helper
   │  └─ useProgress.ts         # localStorage progress hook
   ├─ mock/
   │  ├─ types.ts               # all domain interfaces
   │  ├─ data.ts                # seed data (topics/courses/lessons/...)
   │  ├─ index.ts               # accessor functions (getCourseBySlug, ...)
   │  └─ index.test.ts
   ├─ components/
   │  ├─ layout/                # TopNav, Footer, PageShell, MobileNavDrawer
   │  ├─ ui/                    # Button, Card, Badge, Avatar, ProgressBar,
   │  │                         #   Tabs, Accordion, Input, Rating, IconButton
   │  ├─ home/                  # HeroBanner, CTABanner, CourseCard, CardGrid,
   │  │                         #   ContinueLearning, CollectionGrid, LevelTabs
   │  ├─ course/                # CourseHero, StatsRow, LearnList, SkillsList,
   │  │                         #   CurriculumAccordion, RelatedCourses, TopicHero
   │  └─ learn/                 # VideoPlayer, LessonSidebar, LessonPanel, LearnTopBar
   ├─ routes/
   │  ├─ DashboardPage.tsx      # "/"           Sau đăng nhập
   │  ├─ TopicPage.tsx          # "/topics/:slug"  Chủ đề
   │  ├─ CourseDetailPage.tsx   # "/courses/:slug" Chi tiết khoá học
   │  ├─ LearnPage.tsx          # "/learn/:courseSlug/:lessonId" Học
   │  └─ NotFound.tsx
   └─ assets/                   # exported Figma assets (logos, 3D illustrations, icons)
```

**Route → layout note:** Dashboard, Topic, Course Detail use `PageShell` (TopNav + Footer). LearnPage is a full-screen app layout (its own `LearnTopBar`, no global nav/footer).

---

## Task 0: Scaffold Vite + React + TS + Tailwind

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `postcss.config.js`, `tailwind.config.ts`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/styles/globals.css`

- [ ] **Step 1: Init project + install deps**

Run:
```bash
cd /Users/thachcoder2k2/Projects/Work/Techainer/THS/course-builder
npm create vite@latest . -- --template react-ts
npm install react-router-dom clsx tailwind-merge lucide-react
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```
Expected: `node_modules/`, base Vite files, `tailwind.config.js` + `postcss.config.js` created. (Convert tailwind config to `.ts` in Task 1.)

- [ ] **Step 2: Replace `index.html`**

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Course Builder — THS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Write `src/styles/globals.css`** (font + Tailwind layers; token vars added in Task 1)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
/* NOTE: confirm exact family from Figma Dev Mode in Task 1 (candidate: Be Vietnam Pro). */

@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
html, body, #root { height: 100%; }
body { @apply bg-surface-muted text-ink-900 antialiased; font-family: 'Inter', system-ui, sans-serif; }
```

- [ ] **Step 4: Write minimal `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

- [ ] **Step 5: Write placeholder `src/App.tsx`** (real router in Task 3)

```tsx
export default function App() {
  return <div className="p-10 text-2xl font-bold">Course Builder — scaffold OK</div>;
}
```

- [ ] **Step 6: Verify dev server boots**

Run: `npm run dev`
Expected: server at `http://localhost:5173`, page shows "Course Builder — scaffold OK". Stop server.

- [ ] **Step 7: Init git + commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React + TS + Tailwind"
```

---

## Task 1: Design tokens (`tailwind.config.ts`) + refine from Figma

**Files:**
- Create/replace: `tailwind.config.ts`
- Modify: `src/styles/globals.css` (add CSS vars)

- [ ] **Step 1: Write `tailwind.config.ts`** — eyeballed defaults, refined in Step 3

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF5FF', 100: '#DBE8FE', 200: '#BFD6FE',
          500: '#3B72F6', 600: '#2563EB', 700: '#1D4ED8', 900: '#1E3A8A',
        },
        ink: { 900: '#0F172A', 700: '#334155', 500: '#64748B', 400: '#94A3B8' },
        surface: { DEFAULT: '#FFFFFF', muted: '#F8FAFC', card: '#0B1220' },
        line: '#E2E8F0',
        success: { 50: '#ECFDF5', 600: '#059669' },
        // soft accent cards (footer promos / topic feature cards)
        accent: { blue: '#EAF1FF', peach: '#FFF1E9', lavender: '#F1ECFF', mint: '#E9FBF3' },
      },
      borderRadius: { card: '16px', pill: '999px', btn: '10px' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        pop: '0 12px 32px rgba(15,23,42,0.12)',
      },
      maxWidth: { content: '1200px' },
      fontSize: {
        // label/body/heading scale — confirm against Figma
        'display': ['40px', { lineHeight: '48px', fontWeight: '800' }],
        'h1': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'h3': ['18px', { lineHeight: '28px', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: Add CSS vars mirror in `globals.css`** (append)

```css
@layer base {
  :root {
    --brand-600: #2563EB;
    --ink-900: #0F172A;
    --line: #E2E8F0;
    --radius-card: 16px;
  }
}
```

- [ ] **Step 3: Refine tokens from Figma Dev Mode** (see Figma Access Dependency above)

Procedure:
1. Open the Figma file in Dev Mode (MCP once authed, or Chrome inspect).
2. For the primary button, brand highlight text, dark course-card, page background, borders, and each colored feature card: read the exact fill hex → replace the matching value in `tailwind.config.ts`.
3. Read the text layers' font family, sizes, weights, line-heights → replace `fontSize` scale and the `@import` font in `globals.css`.
4. Read corner radii + shadows from a card node → update `borderRadius`/`boxShadow`.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/styles/globals.css
git commit -m "feat: add Figma design tokens (colors, type, radii, shadows)"
```

---

## Task 2: Mock data model + accessor layer (TDD)

**Files:**
- Create: `src/mock/types.ts`, `src/mock/data.ts`, `src/mock/index.ts`
- Test: `src/mock/index.test.ts`
- Create: `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: Configure Vitest**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'] },
});
```
`vitest.setup.ts`:
```ts
import '@testing-library/jest-dom';
```
Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 2: Write `src/mock/types.ts`**

```ts
export type Level = 'beginner' | 'intermediate' | 'advanced';
export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao',
};

export interface Instructor { id: string; name: string; title: string; avatar: string; bio: string; }
export interface Resource { id: string; label: string; url: string; kind: 'pdf' | 'link' | 'file'; }
export interface Lesson { id: string; title: string; durationMin: number; videoUrl: string; isPreview: boolean; resources: Resource[]; }
export interface Section { id: string; title: string; lessons: Lesson[]; }
export interface Topic { id: string; slug: string; title: string; description: string; coverImage: string; courseIds: string[]; }
export interface Collection { id: string; title: string; description: string; courseIds: string[]; }
export interface User { id: string; name: string; avatar: string; }
export interface Comment { id: string; lessonId: string; authorName: string; authorAvatar: string; text: string; createdAt: string; likes: number; }

export interface Course {
  id: string; slug: string; title: string; subtitle: string; description: string;
  thumbnail: string; coverImage: string; level: Level;
  durationHours: number; lessonCount: number; rating: number; enrolledCount: number;
  instructorId: string; topicIds: string[];
  learnPoints: string[]; skills: string[]; sections: Section[];
}
```

- [ ] **Step 3: Write `src/mock/data.ts`** (representative seed — expand later)

Provide at minimum: 1 `User`, 2 `Instructor`, 2 `Topic` (one = "Trí tuệ nhân tạo"), 8 `Course` across all 3 levels, and for the primary AI course (`slug: 'ai-co-ban-den-thuc-tien'`) fully populate `sections` (3 sections × 3–4 lessons each, each lesson with `durationMin`, `videoUrl: '/media/sample-lesson.mp4'`, some `isPreview: true`, 1–2 `resources`), plus `learnPoints` (6), `skills` (5). Add 2 `Collection` and ~4 `Comment` for the first lesson. Use Vietnamese copy from the Figma frames. `avatar`/`thumbnail`/`coverImage` point to `src/assets/...` (exported in later tasks; use a committed placeholder file until then).

Skeleton (fill all entities to the counts above):
```ts
import type { Course, Topic, Instructor, User, Collection, Comment } from './types';

export const user: User = { id: 'u1', name: 'Học viên THS', avatar: '/src/assets/avatar-user.png' };

export const instructors: Instructor[] = [
  { id: 'in1', name: 'Nguyễn Văn A', title: 'AI Engineer', avatar: '/src/assets/avatar-1.png', bio: '...' },
  // + in2
];

export const topics: Topic[] = [
  { id: 't1', slug: 'tri-tue-nhan-tao', title: 'Trí tuệ nhân tạo',
    description: 'Khám phá các khoá học AI từ cơ bản đến thực tiễn.',
    coverImage: '/src/assets/topic-ai.png', courseIds: ['c1','c2','c3','c4','c5','c6'] },
  // + t2
];

export const courses: Course[] = [
  {
    id: 'c1', slug: 'ai-co-ban-den-thuc-tien',
    title: 'Trí tuệ nhân tạo (AI) từ cơ bản đến thực tiễn',
    subtitle: 'Nắm vững nền tảng AI và ứng dụng thực tế.',
    description: 'Đoạn mô tả dài nhiều câu ...',
    thumbnail: '/src/assets/course-ai.png', coverImage: '/src/assets/course-ai-cover.png',
    level: 'beginner', durationHours: 12, lessonCount: 11, rating: 4.8, enrolledCount: 1240,
    instructorId: 'in1', topicIds: ['t1'],
    learnPoints: ['Hiểu khái niệm AI', '...'], // 6 items
    skills: ['Machine Learning', '...'],        // 5 items
    sections: [
      { id: 's1', title: 'Giới thiệu', lessons: [
        { id: 'l1', title: 'AI là gì?', durationMin: 8, videoUrl: '/media/sample-lesson.mp4', isPreview: true, resources: [] },
        // + l2, l3
      ]},
      // + s2, s3
    ],
  },
  // + c2..c8 (lighter: sections can be shorter for non-primary courses)
];

export const collections: Collection[] = [ /* 2 items */ ];
export const comments: Comment[] = [ /* ~4 items, lessonId: 'l1' */ ];
```

- [ ] **Step 4: Write failing test `src/mock/index.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import {
  getCourses, getCourseBySlug, getCoursesByLevel, getTopicBySlug,
  getCoursesByTopic, getRelatedCourses, flattenLessons, getLesson, searchCourses,
} from './index';

describe('mock accessors', () => {
  it('returns all courses', () => { expect(getCourses().length).toBeGreaterThanOrEqual(8); });
  it('finds a course by slug', () => {
    expect(getCourseBySlug('ai-co-ban-den-thuc-tien')?.title).toContain('Trí tuệ nhân tạo');
  });
  it('returns undefined for unknown slug', () => { expect(getCourseBySlug('nope')).toBeUndefined(); });
  it('filters by level', () => { getCoursesByLevel('beginner').forEach(c => expect(c.level).toBe('beginner')); });
  it('finds topic by slug and its courses', () => {
    const t = getTopicBySlug('tri-tue-nhan-tao'); expect(t).toBeDefined();
    expect(getCoursesByTopic(t!.id).length).toBeGreaterThan(0);
  });
  it('excludes self from related courses', () => {
    const c = getCourseBySlug('ai-co-ban-den-thuc-tien')!;
    expect(getRelatedCourses(c.id).some(r => r.id === c.id)).toBe(false);
  });
  it('flattens lessons in order', () => {
    const c = getCourseBySlug('ai-co-ban-den-thuc-tien')!;
    const flat = flattenLessons(c);
    expect(flat[0].lesson.id).toBe('l1');
    expect(flat.length).toBe(c.sections.reduce((n, s) => n + s.lessons.length, 0));
  });
  it('gets a lesson by course slug + lesson id', () => {
    expect(getLesson('ai-co-ban-den-thuc-tien', 'l1')?.lesson.title).toBe('AI là gì?');
  });
  it('searches courses by title (case-insensitive)', () => {
    expect(searchCourses('trí tuệ').length).toBeGreaterThan(0);
    expect(searchCourses('TRÍ TUỆ').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test -- src/mock/index.test.ts`
Expected: FAIL — `getCourses` (and siblings) not exported from `./index`.

- [ ] **Step 6: Write `src/mock/index.ts`**

```ts
import { courses, topics, instructors, user, collections, comments } from './data';
import type { Course, Level, Topic, Lesson, Section } from './types';

export function getCourses(): Course[] { return courses; }
export function getCourseBySlug(slug: string): Course | undefined { return courses.find(c => c.slug === slug); }
export function getCourseById(id: string): Course | undefined { return courses.find(c => c.id === id); }
export function getCoursesByLevel(level: Level): Course[] { return courses.filter(c => c.level === level); }
export function getFeaturedCourses(n = 4): Course[] { return [...courses].sort((a, b) => b.rating - a.rating).slice(0, n); }

export function getTopics(): Topic[] { return topics; }
export function getTopicBySlug(slug: string): Topic | undefined { return topics.find(t => t.slug === slug); }
export function getCoursesByTopic(topicId: string): Course[] { return courses.filter(c => c.topicIds.includes(topicId)); }

export function getRelatedCourses(courseId: string, n = 3): Course[] {
  const self = getCourseById(courseId);
  if (!self) return [];
  return courses
    .filter(c => c.id !== courseId && c.topicIds.some(t => self.topicIds.includes(t)))
    .slice(0, n);
}

export function getInstructor(id: string) { return instructors.find(i => i.id === id); }
export function getUser() { return user; }
export function getCollections() { return collections; }
export function getCommentsByLesson(lessonId: string) { return comments.filter(c => c.lessonId === lessonId); }

export interface FlatLesson { section: Section; lesson: Lesson; index: number; }
export function flattenLessons(course: Course): FlatLesson[] {
  const out: FlatLesson[] = []; let i = 0;
  for (const section of course.sections)
    for (const lesson of section.lessons) out.push({ section, lesson, index: i++ });
  return out;
}
export function getLesson(courseSlug: string, lessonId: string): FlatLesson | undefined {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;
  return flattenLessons(course).find(f => f.lesson.id === lessonId);
}
export function searchCourses(q: string): Course[] {
  const s = q.trim().toLowerCase();
  if (!s) return courses;
  return courses.filter(c => c.title.toLowerCase().includes(s) || c.subtitle.toLowerCase().includes(s));
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- src/mock/index.test.ts`
Expected: PASS (all cases).

- [ ] **Step 8: Commit**

```bash
git add src/mock vitest.config.ts vitest.setup.ts package.json
git commit -m "feat: typed mock data model + accessor layer with tests"
```

---

## Task 3: App shell + routing (TDD on route render)

**Files:**
- Create: `src/lib/cn.ts`, `src/routes/DashboardPage.tsx`, `src/routes/TopicPage.tsx`, `src/routes/CourseDetailPage.tsx`, `src/routes/LearnPage.tsx`, `src/routes/NotFound.tsx`, `src/components/layout/PageShell.tsx`, `src/components/layout/TopNav.tsx`, `src/components/layout/Footer.tsx`
- Replace: `src/App.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write `src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

- [ ] **Step 2: Write stub pages** (real content in later tasks)

Each of `DashboardPage`, `TopicPage`, `CourseDetailPage`, `LearnPage`, `NotFound` returns a heading with a stable `data-testid`, e.g.:
```tsx
export default function DashboardPage() {
  return <h1 data-testid="page-dashboard">Sau đăng nhập</h1>;
}
```
Use testids: `page-dashboard`, `page-topic`, `page-course`, `page-learn`, `page-404`.

- [ ] **Step 3: Write `src/App.tsx`**

```tsx
import { Routes, Route } from 'react-router-dom';
import PageShell from './components/layout/PageShell';
import DashboardPage from './routes/DashboardPage';
import TopicPage from './routes/TopicPage';
import CourseDetailPage from './routes/CourseDetailPage';
import LearnPage from './routes/LearnPage';
import NotFound from './routes/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<PageShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/topics/:slug" element={<TopicPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* Learn is full-screen, outside PageShell */}
      <Route path="/learn/:courseSlug/:lessonId" element={<LearnPage />} />
    </Routes>
  );
}
```

- [ ] **Step 4: Write `src/components/layout/PageShell.tsx`** (uses `<Outlet/>`)

```tsx
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Footer from './Footer';

export default function PageShell() {
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 5: Write `TopNav.tsx` + `Footer.tsx`** (structural; refine visuals in Task 8/9)

TopNav: sticky top bar, `max-w-content mx-auto`, logo (link to `/`), primary links (Khoá học, Chủ đề, Lộ trình), a search `Input`, user `Avatar`. Include a `lucide-react` `Menu` button shown only `md:hidden` (wired to drawer in Task 9). Footer: `max-w-content`, multi-column link groups + copyright, matching the Figma footer.

- [ ] **Step 6: Write failing test `src/App.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}
describe('routing', () => {
  it('renders dashboard at /', () => { renderAt('/'); expect(screen.getByTestId('page-dashboard')).toBeInTheDocument(); });
  it('renders topic page', () => { renderAt('/topics/tri-tue-nhan-tao'); expect(screen.getByTestId('page-topic')).toBeInTheDocument(); });
  it('renders course detail', () => { renderAt('/courses/ai-co-ban-den-thuc-tien'); expect(screen.getByTestId('page-course')).toBeInTheDocument(); });
  it('renders learn page full-screen', () => {
    renderAt('/learn/ai-co-ban-den-thuc-tien/l1');
    expect(screen.getByTestId('page-learn')).toBeInTheDocument();
  });
  it('renders 404 for unknown route', () => { renderAt('/nope'); expect(screen.getByTestId('page-404')).toBeInTheDocument(); });
});
```

- [ ] **Step 7: Run tests → fail → implement to green**

Run: `npm test -- src/App.test.tsx` → Expected FAIL first (missing pieces), then PASS after Steps 2–5 complete.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/lib src/routes src/components/layout src/App.test.tsx
git commit -m "feat: app shell, routing, PageShell/TopNav/Footer with route tests"
```

---

## Task 4: UI primitives (custom, token-based)

**Files:**
- Create under `src/components/ui/`: `Button.tsx`, `IconButton.tsx`, `Badge.tsx`, `Card.tsx`, `Avatar.tsx`, `ProgressBar.tsx`, `Input.tsx`, `Rating.tsx`, `Tabs.tsx`, `Accordion.tsx`
- Test: `src/components/ui/Tabs.test.tsx`, `src/components/ui/Accordion.test.tsx`

- [ ] **Step 1: Write presentational primitives** (full code, token classes)

`IconButton.tsx`, `Badge.tsx` (level/pill), `Card.tsx` (`rounded-card shadow-card bg-surface`), `Avatar.tsx` (img + fallback initials), `ProgressBar.tsx` (`value: number` 0–100, brand fill), `Input.tsx` (with optional leading icon), `Rating.tsx` (stars from `value`). Each uses only Tailwind token classes from Task 1. Example `Button.tsx`:
```tsx
import { cn } from '../../lib/cn';
import type { ButtonHTMLAttributes } from 'react';
type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';
const V: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'bg-transparent text-ink-700 hover:bg-surface-muted',
};
const S: Record<Size, string> = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-5 text-sm', lg: 'h-12 px-6 text-base' };
export default function Button(
  { variant = 'primary', size = 'md', className, ...p }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size },
) {
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-colors disabled:opacity-50', V[variant], S[size], className)} {...p} />;
}
```

- [ ] **Step 2: Write `Tabs.tsx`** (controlled/uncontrolled, keyboard-accessible)

```tsx
import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
export interface TabItem { id: string; label: string; content: ReactNode; }
export default function Tabs({ items, defaultId }: { items: TabItem[]; defaultId?: string }) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  return (
    <div>
      <div role="tablist" className="flex gap-6 border-b border-line">
        {items.map(t => (
          <button key={t.id} role="tab" aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={cn('relative -mb-px border-b-2 pb-3 text-sm font-semibold',
              active === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-700')}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-5">{items.find(t => t.id === active)?.content}</div>
    </div>
  );
}
```

- [ ] **Step 3: Write `Accordion.tsx`** (multi-open, controlled expand)

```tsx
import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
export interface AccordionItem { id: string; header: ReactNode; body: ReactNode; }
export default function Accordion({ items, defaultOpenIds = [] }: { items: AccordionItem[]; defaultOpenIds?: string[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpenIds));
  const toggle = (id: string) => setOpen(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });
  return (
    <div className="divide-y divide-line rounded-card border border-line bg-surface">
      {items.map(it => {
        const isOpen = open.has(it.id);
        return (
          <div key={it.id}>
            <button onClick={() => toggle(it.id)} aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="font-semibold">{it.header}</span>
              <ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform', isOpen && 'rotate-180')} />
            </button>
            {isOpen && <div className="px-5 pb-4">{it.body}</div>}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Write failing tests for Tabs + Accordion**

`Tabs.test.tsx`: render 2 tabs, assert first panel visible, click second tab → second content visible, `aria-selected` moves.
`Accordion.test.tsx`: render 2 items closed, click header → body appears (`aria-expanded=true`), click again → hides.
```tsx
// Tabs.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs from './Tabs';
it('switches tab content on click', async () => {
  render(<Tabs items={[{ id:'a', label:'A', content:'Alpha' }, { id:'b', label:'B', content:'Beta' }]} />);
  expect(screen.getByText('Alpha')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(screen.getByText('Beta')).toBeInTheDocument();
});
```

- [ ] **Step 5: Run → fail → green**

Run: `npm test -- src/components/ui`
Expected: PASS after Steps 2–3.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui
git commit -m "feat: custom UI primitives (Button, Card, Tabs, Accordion, ...) with tests"
```

---

## Task 5: Dashboard screen — "Sau đăng nhập" (`/`)

**Files:**
- Create: `src/components/home/CourseCard.tsx`, `CardGrid.tsx`, `ContinueLearning.tsx`, `LevelTabs.tsx`, `HeroBanner.tsx`, `CTABanner.tsx`, `CollectionGrid.tsx`
- Replace: `src/routes/DashboardPage.tsx`
- Test: `src/routes/DashboardPage.test.tsx`

- [ ] **Step 1: Write `CourseCard.tsx`** (dark-thumbnail variant from Figma)

Card with dark (`bg-surface-card`) thumbnail area (uses `course.thumbnail` illustration), title, instructor row (Avatar + name), meta row (level `Badge`, `lessonCount` bài học, `durationHours` giờ), `Rating`. Whole card is a `<Link to={`/courses/${course.slug}`}>`. Props: `{ course: Course }`.

- [ ] **Step 2: Write `CardGrid.tsx`** — responsive grid wrapper: `grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with an optional section title + "Xem tất cả" link. Props: `{ title?: string; courses: Course[] }`.

- [ ] **Step 3: Write `ContinueLearning.tsx`** — "Đang học" row. Uses `getFeaturedCourses(3)` + a `ProgressBar` (static percent for now; wired to real `useProgress` in Task 8's polish). Shows course with progress + "Tiếp tục học" `Link` to `/learn/:slug/:firstLesson`.

- [ ] **Step 4: Write `LevelTabs.tsx`** — uses `ui/Tabs`; tabs = Cơ bản / Trung cấp / Nâng cao; each panel renders `CardGrid` of `getCoursesByLevel(level)`.

- [ ] **Step 5: Write `HeroBanner.tsx` + `CTABanner.tsx` + `CollectionGrid.tsx`** — the "Thiết kế lộ trình học" CTA banner (illustration + heading + Button), and collections section (`getCollections()` → colored cards). Colored cards use `accent.*` tokens.

- [ ] **Step 6: Assemble `DashboardPage.tsx`**

```tsx
import ContinueLearning from '../components/home/ContinueLearning';
import LevelTabs from '../components/home/LevelTabs';
import CTABanner from '../components/home/CTABanner';
import CardGrid from '../components/home/CardGrid';
import CollectionGrid from '../components/home/CollectionGrid';
import { getFeaturedCourses } from '../mock';

export default function DashboardPage() {
  return (
    <div data-testid="page-dashboard" className="mx-auto max-w-content px-4 py-8 space-y-12">
      <ContinueLearning />
      <LevelTabs />
      <CTABanner />
      <CardGrid title="Khoá học nổi bật" courses={getFeaturedCourses(8)} />
      <CollectionGrid />
    </div>
  );
}
```

- [ ] **Step 7: Write `DashboardPage.test.tsx`** — render within `MemoryRouter`, assert a known course title appears and a level tab switches the grid.

- [ ] **Step 8: Verify visually + run tests**

Run: `npm run dev` → open `/`, compare to "Sau đăng nhập" frame (spacing, card look, dark thumbnails). Then `npm test -- src/routes/DashboardPage.test.tsx` → PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/home src/routes/DashboardPage.tsx src/routes/DashboardPage.test.tsx
git commit -m "feat: dashboard screen (Sau dang nhap)"
```

---

## Task 6: Topic screen — "Chủ đề" (`/topics/:slug`)

**Files:**
- Create: `src/components/course/TopicHero.tsx`; reuse `home/CardGrid`, `home/CourseCard`, `home/CTABanner`
- Replace: `src/routes/TopicPage.tsx`
- Test: `src/routes/TopicPage.test.tsx`

- [ ] **Step 1: Write `TopicHero.tsx`** — centered hero: eyebrow "Chủ đề", big title with brand-highlighted topic name (`getTopicBySlug`), description. Matches Figma "Chủ đề Trí tuệ nhân tạo" frame. Props: `{ topic: Topic }`.

- [ ] **Step 2: Assemble `TopicPage.tsx`**

```tsx
import { useParams } from 'react-router-dom';
import TopicHero from '../components/course/TopicHero';
import CardGrid from '../components/home/CardGrid';
import CTABanner from '../components/home/CTABanner';
import NotFound from './NotFound';
import { getTopicBySlug, getCoursesByTopic } from '../mock';

export default function TopicPage() {
  const { slug } = useParams();
  const topic = slug ? getTopicBySlug(slug) : undefined;
  if (!topic) return <NotFound />;
  return (
    <div data-testid="page-topic" className="mx-auto max-w-content px-4 py-10 space-y-10">
      <TopicHero topic={topic} />
      <CardGrid courses={getCoursesByTopic(topic.id)} />
      <CTABanner />
    </div>
  );
}
```

- [ ] **Step 3: Test** — render `/topics/tri-tue-nhan-tao`, assert topic title + at least one course card; render unknown slug → 404.

- [ ] **Step 4: Verify visually, run tests, commit**

```bash
git add src/components/course/TopicHero.tsx src/routes/TopicPage.tsx src/routes/TopicPage.test.tsx
git commit -m "feat: topic screen (Chu de)"
```

---

## Task 7: Course Detail — "Chi tiết khoá học" (`/courses/:slug`) + progress hook (TDD)

**Files:**
- Create: `src/lib/useProgress.ts`, `src/lib/useProgress.test.ts`
- Create: `src/components/course/CourseHero.tsx`, `StatsRow.tsx`, `LearnList.tsx`, `SkillsList.tsx`, `CurriculumAccordion.tsx`, `RelatedCourses.tsx`
- Replace: `src/routes/CourseDetailPage.tsx`
- Test: `src/routes/CourseDetailPage.test.tsx`

- [ ] **Step 1: Write failing test `src/lib/useProgress.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgress } from './useProgress';

beforeEach(() => localStorage.clear());
describe('useProgress', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useProgress('c1'));
    expect(result.current.completedLessonIds).toEqual([]);
    expect(result.current.percent(3)).toBe(0);
  });
  it('toggles a lesson complete and persists', () => {
    const { result } = renderHook(() => useProgress('c1'));
    act(() => result.current.toggleComplete('l1'));
    expect(result.current.isCompleted('l1')).toBe(true);
    expect(JSON.parse(localStorage.getItem('progress:c1')!).completedLessonIds).toContain('l1');
  });
  it('computes percent from total', () => {
    const { result } = renderHook(() => useProgress('c1'));
    act(() => { result.current.toggleComplete('l1'); result.current.toggleComplete('l2'); });
    expect(result.current.percent(4)).toBe(50);
  });
});
```

- [ ] **Step 2: Run → fail** (`useProgress` missing). Run: `npm test -- src/lib/useProgress.test.ts` → FAIL.

- [ ] **Step 3: Write `src/lib/useProgress.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';

interface Stored { completedLessonIds: string[]; lastLessonId: string | null; }
const key = (courseId: string) => `progress:${courseId}`;
function read(courseId: string): Stored {
  try { const raw = localStorage.getItem(key(courseId)); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  return { completedLessonIds: [], lastLessonId: null };
}

export function useProgress(courseId: string) {
  const [state, setState] = useState<Stored>(() => read(courseId));
  useEffect(() => { setState(read(courseId)); }, [courseId]);
  const persist = useCallback((next: Stored) => {
    setState(next);
    try { localStorage.setItem(key(courseId), JSON.stringify(next)); } catch { /* ignore */ }
  }, [courseId]);

  const isCompleted = useCallback((lessonId: string) => state.completedLessonIds.includes(lessonId), [state]);
  const toggleComplete = useCallback((lessonId: string) => {
    const done = state.completedLessonIds.includes(lessonId);
    persist({ ...state, completedLessonIds: done
      ? state.completedLessonIds.filter(id => id !== lessonId)
      : [...state.completedLessonIds, lessonId] });
  }, [state, persist]);
  const setLast = useCallback((lessonId: string) => persist({ ...state, lastLessonId: lessonId }), [state, persist]);
  const percent = useCallback((total: number) =>
    total === 0 ? 0 : Math.round((state.completedLessonIds.length / total) * 100), [state]);

  return { ...state, isCompleted, toggleComplete, setLast, percent };
}
```

- [ ] **Step 4: Run → green.** Run: `npm test -- src/lib/useProgress.test.ts` → PASS.

- [ ] **Step 5: Write detail components**

- `CourseHero.tsx` — dark/blue gradient hero card: title, subtitle, `StatsRow`, primary CTA "Vào học" → `Link` to `/learn/${slug}/${firstLessonId}`, secondary "Xem trước". Props: `{ course: Course }`.
- `StatsRow.tsx` — 3 stats (lessonCount bài học, `LEVEL_LABEL[level]`, durationHours giờ) with dividers.
- `LearnList.tsx` — "Bạn sẽ học được gì?" two-column checklist from `course.learnPoints` (lucide `Check`). Props: `{ points: string[] }`.
- `SkillsList.tsx` — "Kỹ năng bạn đạt được" pill badges from `course.skills`. Props: `{ skills: string[] }`.
- `CurriculumAccordion.tsx` — "Nội dung khoá học": maps `course.sections` → `ui/Accordion` items; header = section title + lesson count + total mins; body = lesson rows (title, durationMin, "Xem trước" link if `isPreview` → `/learn/${slug}/${lessonId}`). `defaultOpenIds` = first section. Props: `{ course: Course }`.
- `RelatedCourses.tsx` — "Khoá học liên quan": `getRelatedCourses(course.id)` → `CardGrid`/`CourseCard`. Props: `{ courseId: string }`.

- [ ] **Step 6: Assemble `CourseDetailPage.tsx`**

```tsx
import { useParams } from 'react-router-dom';
import { getCourseBySlug, getInstructor } from '../mock';
import CourseHero from '../components/course/CourseHero';
import LearnList from '../components/course/LearnList';
import SkillsList from '../components/course/SkillsList';
import CurriculumAccordion from '../components/course/CurriculumAccordion';
import RelatedCourses from '../components/course/RelatedCourses';
import NotFound from './NotFound';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const course = slug ? getCourseBySlug(slug) : undefined;
  if (!course) return <NotFound />;
  const instructor = getInstructor(course.instructorId);
  return (
    <div data-testid="page-course" className="mx-auto max-w-content px-4 py-8 space-y-12">
      <CourseHero course={course} />
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <LearnList points={course.learnPoints} />
          <SkillsList skills={course.skills} />
          <section>
            <h2 className="text-h2 mb-4">Nội dung khoá học</h2>
            <CurriculumAccordion course={course} />
          </section>
        </div>
        {/* sidebar: instructor card (sticky on lg) */}
        <aside className="lg:sticky lg:top-24 h-fit">{/* instructor?.name, title, bio */}</aside>
      </div>
      <RelatedCourses courseId={course.id} />
    </div>
  );
}
```

- [ ] **Step 7: Test `CourseDetailPage.test.tsx`** — render `/courses/ai-co-ban-den-thuc-tien`; assert title, a stat (lessonCount), a section header from curriculum, and a related course present. Assert unknown slug → 404.

- [ ] **Step 8: Verify visually, run tests, commit**

```bash
git add src/lib/useProgress.ts src/lib/useProgress.test.ts src/components/course src/routes/CourseDetailPage.tsx src/routes/CourseDetailPage.test.tsx
git commit -m "feat: course detail screen + progress hook (Chi tiet khoa hoc)"
```

---

## Task 8: Lesson Player — "Học" (`/learn/:courseSlug/:lessonId`)

**Files:**
- Create: `public/media/sample-lesson.mp4` (download an open-source clip)
- Create: `src/components/learn/VideoPlayer.tsx`, `LessonSidebar.tsx`, `LessonPanel.tsx`, `LearnTopBar.tsx`
- Replace: `src/routes/LearnPage.tsx`
- Test: `src/components/learn/VideoPlayer.test.tsx`, `src/routes/LearnPage.test.tsx`

- [ ] **Step 1: Add sample video**

Run:
```bash
mkdir -p public/media
curl -L -o public/media/sample-lesson.mp4 https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4
```
Expected: ~1MB mp4 at `public/media/sample-lesson.mp4`. (If URL unavailable, substitute any small CC/public-domain mp4 and update the path.) **Ask before downloading** if network fetch requires approval.

- [ ] **Step 2: Write failing test `VideoPlayer.test.tsx`** (control logic; jsdom stubs play/pause)

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import VideoPlayer from './VideoPlayer';

it('toggles play/pause button state', async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  render(<VideoPlayer src="/media/sample-lesson.mp4" onEnded={() => {}} />);
  const btn = screen.getByRole('button', { name: /phát|play/i });
  await userEvent.click(btn);
  expect(play).toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: /dừng|pause/i }));
  expect(pause).toHaveBeenCalled();
});
```

- [ ] **Step 3: Write `VideoPlayer.tsx`** (custom controls: play/pause, seek, time, speed, fullscreen)

Full component with a `ref` to `<video>`, state for `playing`, `current`, `duration`, `rate`; handlers `onTimeUpdate`, `onLoadedMetadata`, `onEnded` (prop). Controls bar overlays bottom: play/pause `IconButton` (accessible name toggles "Phát"/"Dừng"), a range `<input type="range">` seek bound to `current`/`duration`, `mm:ss / mm:ss` label, speed `<select>` (0.5–2×), fullscreen button (`requestFullscreen`). Style to Figma. Props: `{ src: string; poster?: string; onEnded: () => void }`.

- [ ] **Step 4: Run → green.** Run: `npm test -- src/components/learn/VideoPlayer.test.tsx` → PASS.

- [ ] **Step 5: Write `LessonSidebar.tsx`**

Left rail: course title + `ProgressBar` (percent from `useProgress`), then sections with lessons. Each lesson row = `<Link>` to `/learn/:courseSlug/:lessonId`, shows duration, a completion check (from `useProgress.isCompleted`), highlights the active lesson (compare `activeLessonId`). Props: `{ course: Course; activeLessonId: string; progress: ReturnType<typeof useProgress>; className?: string }`.

- [ ] **Step 6: Write `LessonPanel.tsx`**

Right rail using `ui/Tabs`: tabs = Ghi chú / Bình luận / Tài liệu. "Bình luận" lists `getCommentsByLesson(lessonId)` (Avatar, name, text, likes) + a disabled/mock comment box. "Tài liệu" lists `lesson.resources`. "Ghi chú" = mock notes textarea (local state only). Props: `{ lesson: Lesson; className?: string }`.

- [ ] **Step 7: Write `LearnTopBar.tsx`** — full-width bar: back/close `Link` to course detail, course title, overall progress %, next/prev lesson controls. Props: `{ course: Course; progress: ReturnType<typeof useProgress> }`.

- [ ] **Step 8: Assemble `LearnPage.tsx`** (3-pane full-screen; wires progress + next-lesson)

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCourseBySlug, getLesson, flattenLessons } from '../mock';
import { useProgress } from '../lib/useProgress';
import LearnTopBar from '../components/learn/LearnTopBar';
import LessonSidebar from '../components/learn/LessonSidebar';
import LessonPanel from '../components/learn/LessonPanel';
import VideoPlayer from '../components/learn/VideoPlayer';
import NotFound from './NotFound';

export default function LearnPage() {
  const { courseSlug, lessonId } = useParams();
  const navigate = useNavigate();
  const course = courseSlug ? getCourseBySlug(courseSlug) : undefined;
  const flat = course && lessonId ? getLesson(courseSlug!, lessonId) : undefined;
  const progress = useProgress(course?.id ?? '');
  useEffect(() => { if (flat) progress.setLast(flat.lesson.id); }, [flat?.lesson.id]); // eslint-disable-line
  if (!course || !flat) return <NotFound />;

  const all = flattenLessons(course);
  const next = all[flat.index + 1];
  const handleEnded = () => {
    progress.toggleComplete(flat.lesson.id);
    if (next) navigate(`/learn/${course.slug}/${next.lesson.id}`);
  };
  return (
    <div data-testid="page-learn" className="flex h-screen flex-col">
      <LearnTopBar course={course} progress={progress} />
      <div className="flex min-h-0 flex-1">
        <LessonSidebar course={course} activeLessonId={flat.lesson.id} progress={progress}
          className="hidden lg:block w-80 shrink-0 overflow-y-auto border-r border-line" />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <VideoPlayer src={flat.lesson.videoUrl} onEnded={handleEnded} />
          <div className="mx-auto max-w-3xl px-4 py-6">
            <h1 className="text-h2">{flat.lesson.title}</h1>
          </div>
        </main>
        <LessonPanel lesson={flat.lesson} className="hidden xl:block w-96 shrink-0 overflow-y-auto border-l border-line" />
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Test `LearnPage.test.tsx`** — render `/learn/ai-co-ban-den-thuc-tien/l1`; assert lesson title, a sidebar lesson link, and the video element present. (Mock `HTMLMediaElement.play`.)

- [ ] **Step 10: Verify visually, run tests, commit**

```bash
git add public/media src/components/learn src/routes/LearnPage.tsx src/components/learn/VideoPlayer.test.tsx src/routes/LearnPage.test.tsx
git commit -m "feat: lesson player screen with custom video player (Hoc)"
```

---

## Task 9: Responsive pass (mobile + tablet)

**Files:**
- Create: `src/components/layout/MobileNavDrawer.tsx`
- Modify: `TopNav.tsx`, `LessonSidebar.tsx`, `LessonPanel.tsx`, `LearnPage.tsx`, grids as needed

- [ ] **Step 1: Mobile nav** — `MobileNavDrawer.tsx` (slide-over from left, backdrop, close on route change/Escape). Wire the `Menu` button in `TopNav` to open it. Hide desktop links below `md`.

- [ ] **Step 2: Learn page mobile layout** — below `lg`: hide side rails; add a bottom action bar with two buttons: "Danh sách bài" (opens `LessonSidebar` as a bottom-sheet/drawer) and "Ghi chú/Bình luận" (opens `LessonPanel` as a drawer). Video goes full-width.

- [ ] **Step 3: Verify each screen at 3 widths**

Run: `npm run dev`, use browser devtools responsive at 375 / 768 / 1280. Check: no horizontal scroll, grids reflow 1→2→3/4, hero text wraps, course-detail sidebar stacks under content, learn drawers work.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/MobileNavDrawer.tsx src/components src/routes
git commit -m "feat: responsive layouts (mobile nav drawer, learn bottom sheets, grid reflow)"
```

---

## Task 10: Assets, polish, README, final verify

**Files:**
- Add exported Figma assets to `src/assets/` (logos, 3D illustrations, icons, avatars)
- Create: `README.md`

- [ ] **Step 1: Import real Figma assets** — export from Dev Mode (SVG for icons/logo, PNG/WebP for illustrations) into `src/assets/`, replace placeholder paths referenced in `data.ts` and components.

- [ ] **Step 2: Visual polish pass** — compare each screen side-by-side with its Figma frame; fix spacing, font weights, colors, shadows against the refined tokens.

- [ ] **Step 3: Write `README.md`** — how to run (`npm install`, `npm run dev`, `npm test`), tech stack, folder map, "mock data lives in `src/mock`, swap accessors for real API later", Figma link.

- [ ] **Step 4: Full test + typecheck + build**

Run:
```bash
npm test
npx tsc --noEmit
npm run build
```
Expected: all tests PASS, no type errors, production build succeeds.

- [ ] **Step 5: Manual click-through** — `npm run dev`: `/` → click a course → course detail → "Vào học" → lesson plays → next lesson auto-advances → progress bar updates → refresh page → progress persisted. Nav between all 4 screens works.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: real Figma assets, polish, README, final verification"
```

---

## Self-Review (coverage check)

- **Stack** (React+Vite+TS+Tailwind) → Task 0. ✓
- **Custom components** (no lib) → Tasks 4–8 build all components by hand. ✓
- **All 4 screens, linked flow** → Dashboard (5), Topic (6), Course Detail (7), Learn (8); links wired (CourseCard→detail, hero CTA→learn, next-lesson auto-advance). ✓
- **High fidelity from Figma** → tokens Task 1 + refine step; assets Task 10; dependency called out up front. ✓
- **Typed mock + accessor layer** → Task 2. ✓
- **Fully responsive** → Task 9 + responsive grids throughout. ✓
- **Router + functional widgets** → Task 3 router; Tabs/Accordion (4), level filter (5), video controls + progress (7/8). ✓
- **Real HTML5 video + custom controls** → Task 8. ✓
- **Assumptions confirmed in design:** no login page (start at `/` dashboard, mock user); Vietnamese hardcoded, no i18n. ✓

**Type-consistency check:** `Course`/`Lesson`/`Section`/`FlatLesson` names + `flattenLessons`/`getLesson`/`useProgress` signatures are used identically across Tasks 2, 7, 8. `Level` values `beginner|intermediate|advanced` consistent (LevelTabs, getCoursesByLevel). `useProgress` return shape (`isCompleted`, `toggleComplete`, `setLast`, `percent`, `completedLessonIds`) matches usage in Tasks 7/8. ✓

**Open dependency (not a plan gap):** exact token hex/fonts + real assets require live Figma access (Task 1 Step 3, Task 10 Step 1). Video download (Task 8 Step 1) needs network + your OK.
