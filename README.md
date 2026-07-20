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

## Design tokens

The Figma design is built on **Untitled UI**. `tailwind.config.ts` mirrors the Figma token
names via Tailwind's per-utility colour scales, so class names map 1:1 to Dev Mode.

Values were **extracted from the Figma Dev Mode inspector** (read off the colour swatches in
the Inspect panel), not guessed:

| Figma token | Hex | Tailwind class |
| --- | --- | --- |
| `Background/bg-primary` | `#FFFFFF` | `bg-primary` |
| `Background/bg-secondary` | `#FAFAFA` | `bg-secondary` |
| `Background/bg-tertiary` | `#F5F5F5` | `bg-tertiary` |
| `Text/text-primary (900)` | `#181D27` | `text-primary` |
| `Text/text-secondary (700)` | `#414651` | `text-secondary` |
| `Text/text-tertiary (600)` | `#535862` | `text-tertiary` |
| `Text/text-quaternary (500)` | `#717680` | `text-quaternary` |
| `Text/text-brand-secondary (700)` | `#055BE6` | `text-brand-secondary` |
| `Border/border-primary` | `#D5D7DA` | `border-primary` |
| `Border/border-secondary` | `#E9EAEB` | `border-secondary` |
| `Buttons/Primary/button-primary-bg` | `#20447E` | `bg-button-primary` |
| `Buttons/Secondary/button-secondary-border` | `#D5D7DA` | `border-button-secondary` |
| `Icons/icon-fg-brand` | `#0D67F7` | `text-brand-tertiary` |
| `Foreground/fg-quinary (400)` | `#A4A7AE` | `text-fg-quinary` |
| `Utility/Blue/utility-blue-50/200/700` | `#EFF8FF` `#B2DDFF` `#175CD3` | `utility-blue-*` |
| `Utility/Orange/utility-orange-500` | `#EF6820` | `utility-orange-500` |
| `Utility/Gray blue/utility-gray-blue-500` | `#4E5BA6` | `utility-gray-blue-500` |
| `Gradient/skeuemorphic-gradient-border` | `#1E4079` | `canvas-deep` |

Note the primary button is **navy `#20447E`**, not a bright blue — brand blue `#0D67F7` is
used for icons and links.

A few ramp steps are marked `INFERRED` in `tailwind.config.ts` (gray 25/800, brand
25/100/300/400/800, and the success/accent tints). No node in the inspected frames used
them, so they're filler — replace if a design ever needs them.

## Known gaps / next steps

- **No exported Figma art.** Course thumbnails render as deterministic dark gradients and
  avatars fall back to initials, standing in for the real illustrations/logos.
- **Typography not yet extracted** — font family and the type scale still need confirming
  against Dev Mode (colours are done).
- **Sample video** at `public/media/sample-lesson.mp4` is a locally generated ffmpeg test
  pattern, not real course footage.
- No login screen (the app starts in a mocked signed-in state) and no i18n — Vietnamese copy
  is hardcoded, matching the Figma.

Figma source: https://www.figma.com/design/TB2dDlsgmJ6GDdCY6E47gQ/Cource-builder--Copy-

Implementation plan: `docs/superpowers/plans/2026-07-20-course-builder-ui-mock.md`
