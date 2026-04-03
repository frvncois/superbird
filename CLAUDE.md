# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + production build
npm run build-only   # Production build without type-check
npm run type-check   # Run vue-tsc type checking only
npm run preview      # Preview production build locally
```

No test runner is configured.

## Architecture

Vue 3 SPA using Composition API with `<script setup>` syntax throughout.

- **Entry**: `index.html` → `src/main.ts` — mounts app, initializes Pinia, Vue Router, and Lenis scroll
- **Routing**: `src/router/index.ts` — 6 lazy-loaded routes: `/`, `/audit`, `/compress`, `/dns`, `/api`, `/terms`. `scrollBehavior` resets to top on every navigation.
- **State**: Pinia stores in `src/stores/` using the Composition API style (`defineStore` with setup function). One store per tool: `useAuditStore`, `useDnsStore`, `useApiStore`, and `useAppStore` (compression).
- **Styles**: Tailwind CSS v4 via `@tailwindcss/vite` — no `tailwind.config.js`. All theme tokens (colors, fonts, animations) live in `src/assets/main.css` under `@theme`. Dark mode is class-based (`.dark` on `<html>`), toggled manually only — system preference is intentionally ignored.
- **Path alias**: `@/` resolves to `src/`

TypeScript is configured with `noUncheckedIndexedAccess: true` — array/object index access returns `T | undefined`.

## Key Composables

- **`useLenis`** — Singleton smooth scroll. `createLenis()` is called once in `main.ts`. Use `useLenis()` anywhere to get the instance. Call `lenis.stop()` / `lenis.start()` to lock/unlock scroll (e.g. when a modal opens). Add `data-lenis-prevent` to any scrollable element inside a locked context so native scroll still works within it.
- **`useRouteLeave`** — Blocks navigation for 400ms to let exit animations complete. Any component that plays an exit animation should use this. The `leaving` ref drives animation state.
- **`useTheme`** — Persists dark/light to localStorage, applies `dark` class to `<html>`. Default is light; only activates dark if user has previously toggled it.
- **`useAboutModal`** — Simple singleton ref for the About modal open/close state.

## UI Components (`src/components/ui/`)

All built from scratch, no component library. Key ones:

- **`UiButton`** — `variant` (default/outline/ghost) + `size` (default/md/sm/xs)
- **`UiBadge`** — `label` + `color` (green/blue/purple/red/yellow/orange/dark/light). Renders with a dot prefix.
- **`UiInput`** — `variant` (default/lookup) + `size` (default/sm). Use `v-model`.
- **`UiLookup`** — Combined input + action button with slot-based label/icon transitions. Used as the primary search/submit control on tool pages.
- **`UiCard`** — RouterLink wrapper with hover arrow effect. Used on the home tools grid.
- **`UiList`** — Bordered card with a header section (icon, title, description, optional count badge) and a default slot for list content. Supports staggered entrance via `animationDelay` prop.

## Animation System

CSS keyframes defined in `main.css`:
- `superbird-intro-enter` / `superbird-intro-exit` — fade + translateY, used for text/content
- `superbird-hero-icon-enter` / `superbird-hero-icon-exit` — flying icon animation for HomeHero
- `superbird-fade-in`, `superbird-skeleton-pulse`, `superbird-modal-in`, `superbird-fade-in-up`

Staggered entrance animations are applied via inline `:style` bindings with increasing `delay` values. Exit animations are triggered by `useRouteLeave`'s `leaving` ref. The route navigation is blocked for 400ms to let all exits finish — keep exit animation durations under that.

## Audit Tool (`/audit`)

Wraps the Google PageSpeed Insights API (Lighthouse v5). Key files:

- **`src/utils/audit.ts`** — `runAudit(url, strategy, signal)` fetches from the PageSpeed API using `VITE_PAGESPEED_API_KEY`. Also exports `scoreColor`, `scoreOffset`, and `stripMarkdownLinks` helpers.
- **`src/utils/auditActions.ts`** — `AUDIT_ACTIONS` map: Lighthouse audit ID → `{ label, fix, category, explain, prompt?, route?, cta? }`. Image-category actions link to `/compress`. Extend this map to add CTA/explanations for new audit IDs.
- **`src/utils/auditInsights.ts`** — `getAuditInsight()` returns a plain-English one-liner root cause based on TBT, LCP, and failing audit IDs.
- **`src/utils/auditSummary.ts`** — `buildAuditSummary()` builds the plain-text summary paragraph displayed in `AuditSummary.vue`.
- **`src/utils/summaryParser.ts`** — Parses the summary string into typed `SummaryPart[]` tokens (`text | issue | br`) so issue names can be rendered with hover tooltips.
- **`src/utils/detectStack.ts`** — Heuristic HTML/URL fingerprinting to detect frameworks (React, Vue, Next.js, Nuxt, etc.) from Lighthouse audit item data.
- **`src/utils/exportAudit.ts`** — `exportMarkdown`, `exportCSV`, `exportPDF` for download buttons in `AuditSummary.vue`.
- **`src/stores/useAuditStore.ts`** — Central store. Computed properties: `scores`, `vitals`, `opportunities`, `diagnostics`, `passedAudits`, `seoAudits`, `topIssuesWithActions` (top 3, sorted by priority), `quickVerdict`, `detectedStack`, `auditSummary`, `fixPlanPrompt`. Priority scoring in `topIssuesWithActions` weights savings-ms (60%), score penalty (30%), and image boost (15% if bytes > 100 KB).

`VITE_PAGESPEED_API_KEY` must be set in `.env.local` for audits to work.
