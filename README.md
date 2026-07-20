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

Pulled from Figma via the **Figma MCP** (`get_variable_defs`) on the "Cource builder" file.
Every value is the real token — nothing inferred. The design uses **Untitled UI**, and
`tailwind.config.ts` mirrors the Figma token names so classes map 1:1 to Dev Mode.

**Colour** — `bg-primary` `#FFFFFF` · `bg-secondary` `#FAFAFA` · `bg-tertiary` `#F5F5F5` ·
`text-primary` `#181D27` · `text-secondary` `#414651` · `text-tertiary` `#535862` ·
`text-quaternary` `#717680` · `border-primary` `#D5D7DA` · `border-secondary` `#E9EAEB` ·
`bg-button-primary` `#20447E` · `text-brand-secondary` `#055BE6` · brand blue `#0D67F7`

THS brand: **Brand/1 `#1F427A`** (navy), **Brand/2 `#E9772C`** (orange).
Note the primary button is navy, not bright blue.

**Type** — Inter for both body and display.

| Token | Size / line-height |
| --- | --- |
| `text-xs` | 12 / 18 |
| `text-sm` | 14 / 20 |
| `text-md` | 16 / 24 |
| `text-lg` | 18 / 28 |
| `text-xl` | 20 / 30 |
| `text-display-xs` | 24 / 32, 600 |
| `text-display-sm` | 30 / 38, 600 |
| `text-display-lg` | 48 / 60, 600, -2% tracking |

Weights: regular 400, medium 500, semibold 600.

**Spacing** — `xxs` 2 · `xs` 4 · `sm` 6 · `md` 8 · `lg` 12 · `xl` 16 · `2xl` 20 · `3xl` 24 ·
`4xl` 32 · `5xl` 40 · `6xl` 48 · `7xl` 64 · `8xl` 80 · `9xl` 96

**Radius** — `sm` 6 · `md` 8 · `lg` 10 · `xl` 12 · `2xl` 16 · `4xl` 24 · `full` 9999

**Shadows** — `shadow-xs` = `0 1px 2px #0A0D120D`; `shadow-sm` = `0 1px 2px -1px #0A0D121A, 0 1px 3px #0A0D121A`

**Layout** — container max-width 1280, desktop padding 32, paragraph max-width 720.

## Known gaps / next steps

- **Layout fidelity.** Screen composition (section order, spacing rhythm, card anatomy) was
  built from screenshots, not from per-node Figma data. Tokens are exact; the arrangement
  still needs a pass against `get_design_context` per node.
- **No exported Figma art.** Course thumbnails render as deterministic dark gradients and
  avatars fall back to initials.
- **Sample video** at `public/media/sample-lesson.mp4` is a generated ffmpeg test pattern.
- No login screen (mocked signed-in state) and no i18n — Vietnamese copy is hardcoded.

Figma source: https://www.figma.com/design/TB2dDlsgmJ6GDdCY6E47gQ/Cource-builder--Copy-

Implementation plan: `docs/superpowers/plans/2026-07-20-course-builder-ui-mock.md`
