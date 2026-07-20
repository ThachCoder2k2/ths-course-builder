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

The Figma design is built on **Untitled UI**, using unmodified token names. `tailwind.config.ts`
mirrors those names via Tailwind's per-utility colour scales, so class names match Figma directly:

| Figma token | Tailwind class |
| --- | --- |
| `Colors/Background/bg-primary` | `bg-primary` |
| `Colors/Background/bg-secondary` | `bg-secondary` |
| `Colors/Text/text-primary (900)` | `text-primary` |
| `Colors/Text/text-secondary (700)` | `text-secondary` |
| `Colors/Text/text-tertiary (600)` | `text-tertiary` |
| `Colors/Border/border-secondary` | `border-secondary` |
| `Components/Buttons/Primary/button-primary-bg` | `bg-button-primary` |

**Verified against Figma Dev Mode:**

- `bg-primary` = `#FFFFFF`
- `skeuemorphic-gradient-border` = `#1E4079`

**Not yet verified.** Every other value is the *standard Untitled UI ramp*, inferred because the
design uses unmodified Untitled UI token names — it is not extracted from the file. The variables
live in an external Untitled UI library, not in this Figma file or the team library, so they can't
be read from either Variables panel. To confirm them, a Figma account with a **Dev or Full seat**
can run the Figma MCP `get_variable_defs` and return all ~40 tokens in one call. Corrections go in
`tailwind.config.ts` only — one line per token.

## Known gaps / next steps

- **Colour values need confirming** (see above). Structure and naming are correct; exact hexes are inferred.
- **No exported Figma art.** Course thumbnails render as deterministic dark gradients and avatars
  fall back to initials, standing in for the real illustrations/logos.
- **Sample video** at `public/media/sample-lesson.mp4` is a locally generated ffmpeg test pattern,
  not real course footage.
- No login screen (the app starts in a mocked signed-in state) and no i18n — Vietnamese copy is
  hardcoded, matching the Figma.

Figma source: https://www.figma.com/design/TB2dDlsgmJ6GDdCY6E47gQ/Cource-builder--Copy-

Implementation plan: `docs/superpowers/plans/2026-07-20-course-builder-ui-mock.md`
