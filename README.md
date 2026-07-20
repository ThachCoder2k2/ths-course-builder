# Course Builder — UI mock (THS / GK EBOOKS)

A UI-only, fully-responsive React prototype of the THS learning platform, reproducing the
four Figma screens. Everything is driven by **typed mock data** — there is no backend.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build
```

## Screens

| Screen | Route | Notes |
| --- | --- | --- |
| Sau đăng nhập (dashboard) | `/` | Continue-learning, courses by level, CTA, featured, collections |
| Chủ đề (topic) | `/topics/:slug` | `tri-tue-nhan-tao`, `khoa-hoc-du-lieu` |
| Chi tiết khoá học | `/courses/:slug` | Hero + stats, outcomes, skills, curriculum accordion, related |
| Học (lesson player) | `/learn/:courseSlug/:lessonId` | 3-pane: lesson list · video · notes/comments |

Start here: `/courses/ai-co-ban-den-thuc-tien` is the fully-populated course (11 lessons).

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · react-router-dom v6 · Vitest + React Testing Library.
All components are hand-built (no component library).

## Structure

```
src/
├─ routes/       one page per URL
├─ components/
│  ├─ layout/    TopNav, Footer, PageShell, MobileNavDrawer
│  ├─ ui/        custom primitives (Button, Card, Tabs, Accordion, Drawer, ...)
│  ├─ home/      dashboard sections + CourseCard/CardGrid
│  ├─ course/    course-detail sections
│  └─ learn/     VideoPlayer, LessonSidebar, LessonPanel, LearnTopBar
├─ mock/         types.ts · data.ts (seed) · index.ts (accessors)
├─ lib/          cn, progress (localStorage), useProgress
└─ styles/       globals.css
```

## Swapping in a real API

All data access goes through the accessor functions in `src/mock/index.ts`
(`getCourses`, `getCourseBySlug`, `getLesson`, ...). Components never import `data.ts`
directly, so replacing that one module with real API calls is the only change needed.

## State

Learner progress (completed lessons + last lesson) persists to `localStorage` under
`progress:<courseId>`, so the prototype keeps its state across reloads.

## Known gaps / next steps

- **Design tokens are eyeballed.** `tailwind.config.ts` holds approximate colors, type
  scale, radii and shadows taken from the Figma screenshots. They still need to be
  refined against Figma Dev Mode for pixel accuracy.
- **No exported Figma art.** Course thumbnails render as deterministic dark gradients and
  avatars fall back to initials, standing in for the real illustrations/logos.
- **Sample video** at `public/media/sample-lesson.mp4` is a locally generated ffmpeg test
  pattern, not real course footage.
- No login screen (the app starts in a mocked signed-in state) and no i18n — Vietnamese
  copy is hardcoded, matching the Figma.

Figma source: https://www.figma.com/design/TB2dDlsgmJ6GDdCY6E47gQ/Cource-builder--Copy-

Implementation plan: `docs/superpowers/plans/2026-07-20-course-builder-ui-mock.md`
