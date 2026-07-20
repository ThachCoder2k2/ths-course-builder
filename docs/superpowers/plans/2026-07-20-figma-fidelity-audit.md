# Figma Fidelity Audit & Rebuild Plan

**Goal:** Make every screen match the Figma file exactly — layout, spacing, typography,
component anatomy and assets — replacing the screenshot-derived approximations currently
in the codebase.

**Status of tokens:** DONE. `tailwind.config.ts` holds the real Figma variable values
(colour, type, spacing, radius, shadow) pulled via `get_variable_defs`. This plan is about
**layout and component structure**, which is still my invention.

**Access:** Figma MCP authenticated as `techaineroperation@gmail.com` (Dev seat, pro tier).
File key `TB2dDlsgmJ6GDdCY6E47gQ`.

---

## Node ID map (page `0:1`)

| Node ID | Frame | Size | Built? |
| --- | --- | --- | --- |
| `39:5663` | Trang chủ (home v1) | 1920×1428 | ❌ not built |
| `39:7936` | Trang chủ (home v2) | 1920×1412 | ❌ not built |
| `177:2981` | **Sau đăng nhập** (dashboard) | 1920×4083 | ⚠️ approximated |
| `181:4130` | **Chủ đề** (topic) | 1920×3342 | ⚠️ approximated |
| `182:11923` | **Chi tiết khoá học** (course detail) | 1920×3533 | ⚠️ approximated |
| `204:4565` | **Học** (lesson player) | 1920×1080 | ⚠️ approximated |
| `197:7904` | Học — variant 2 | 1920×1080 | ❌ not built |
| `211:10306` | Học — variant 3 | 1920×1080 | ❌ not built |
| `167:3973` | Desktop | 1920×3770 | ❌ not built |
| `65:2189` | Sidebar navigation (component) | 336×1205 | ❌ not built |

### Section breakdown

**Sau đăng nhập `177:2981`**
| Node | Section | Height |
| --- | --- | --- |
| `177:2982` | Hero header section (nav) | 76 |
| `177:3007` | Testimonial section (main content) | 3121 |
| `177:2985` | Banner | 404 |
| `177:3230` | Footer | 480 |

**Chủ đề `181:4130`**
| Node | Section | Height |
| --- | --- | --- |
| `181:7288` | Hero header section | 424 |
| `181:4156` | Testimonial section | 2132 |
| `182:7394` | CTA section | 304 |
| `181:4379` | Footer | 480 |

**Chi tiết khoá học `182:11923`**
| Node | Section | Height |
| --- | --- | --- |
| `182:11924` | Hero header section (nav) | 76 |
| `182:12813` | Frame 7 (course hero) | 524 |
| `182:11934` | Testimonial section (main) | 1909 |
| `184:10744` | Section (related) | 542 |
| `182:12242` | Footer | 480 |
| `184:4582` | Container | 106 |

**Học `204:4565`**
| Node | Section | Height |
| --- | --- | --- |
| `204:4566` | Dropdown header navigation | 80 |
| `204:4576` | Frame 7 (player + panels) | 998 |
| `211:10281` | Tooltip | 34 |

---

## Confirmed gaps (from `177:2982`, the nav)

The nav is representative of how far the approximations drift:

| Aspect | Figma | Current code |
| --- | --- | --- |
| Shape | floating card, `radius-2xl` 16px, `border-secondary`, `shadow-xs` | full-width sticky bar |
| Container | `max-w-1280`, `px-32`, header `pt-12` | `max-w-content`, `px-4`, h-16 |
| Padding | `pl-16 pr-12 py-12` | `h-16` centred |
| Nav items | 2 **dropdowns**: "Chủ đề", "Học tập của tôi", chevron-down, gap 20 | 3 plain links |
| Type | text-md (16/24) **semibold**, `#535862` | text-sm semibold |
| Search | **480px**, `radius-md`, `border-primary`, `shadow-xs`, search-lg icon, placeholder "Hôm nay bạn muốn tìm hiểu chủ đề gì?" | 224px, generic placeholder |
| Avatar | **40px**, contrast border 0.75px rgba(0,0,0,.08) | 32px, no border |
| Logo | **none in nav** | "GK THS Learning" present |
| Background | hero image + gradient-to-white + masked 1440² grid pattern | none |

Expect a similar magnitude of drift in every other section.

---

## Method (per section)

1. `get_design_context` on the section node (use `excludeScreenshot: true` for large nodes;
   outputs run ~8k tokens per section).
2. Translate the returned React/Tailwind into this project's conventions:
   - Replace `var(--colors/...)` with our semantic classes (`bg-primary`, `text-tertiary`, ...)
   - Replace `var(--spacing-*)`/`var(--radius-*)` with our scale (`p-xl`, `rounded-2xl`, ...)
   - Keep our component split and mock-data props — do **not** inline Figma's flat markup
3. Rebuild the component, run `npm run build` + `npm test`.
4. **Verify in the browser** — compare computed styles and screenshot against
   `get_screenshot` of the same node. Build passing is not proof; a class typo silently
   renders nothing.
5. Commit per section.

### Assets
Figma asset URLs from `get_design_context` **expire after 7 days**. Use `download_assets`
to pull icons/illustrations into `src/assets/` permanently.
⚠️ Requires the user's explicit go-ahead before downloading.

---

## Phases

### Phase 0 — Shared chrome (touches every screen, do first)
- [ ] `177:2982` Nav → rebuild `TopNav` as floating card + dropdowns + 480px search + 40px avatar
- [ ] `177:3230` Footer (480px) → rebuild `Footer`
- [ ] Background pattern + hero gradient treatment
- [ ] Re-verify all 4 screens still render

### Phase 1 — Sau đăng nhập `177:2981`
- [ ] `177:3007` main content (3121px) — likely several sub-sections; drill one level first
- [ ] `177:2985` Banner (404px) — **missing entirely** from current build
- [ ] Reconcile section order against current `DashboardPage`

### Phase 2 — Chi tiết khoá học `182:11923`
- [ ] `182:12813` course hero (524px)
- [ ] `182:11934` main content (1909px)
- [ ] `184:10744` related section (542px)
- [ ] `184:4582` container (106px)

### Phase 3 — Chủ đề `181:4130`
- [ ] `181:7288` hero (424px — much taller than current centred hero)
- [ ] `181:4156` grid section (2132px)
- [ ] `182:7394` CTA section (304px)

### Phase 4 — Học `204:4565`
- [ ] `204:4566` header (80px)
- [ ] `204:4576` player + panels (998px)
- [ ] `211:10281` tooltip
- [ ] Decide whether variants `197:7904` / `211:10306` are states of one screen or separate screens

### Phase 5 — Screens not yet built (scope decision needed)
- [ ] `39:5663` / `39:7936` Trang chủ — public homepage, no route exists
- [ ] `167:3973` Desktop
- [ ] `65:2189` Sidebar navigation component

---

## Decisions (confirmed)

1. **Scope** — the **4 existing screens only**. Trang chủ, Desktop and the extra Học
   variants are out of scope. Phase 5 is dropped.
2. **Responsive** — **match Figma exactly at 1920px, and keep the responsive behaviour**
   below it. Breakpoints under 1280px remain our invention (Figma defines none).
3. **Assets** — **download** Figma icons/illustrations into `src/assets/` (approved).
4. **Fidelity bar** — desktop-exact.
