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

No test runner is configured yet.

## Architecture

Vue 3 SPA using Composition API with `<script setup>` syntax throughout.

- **Entry**: `index.html` → `src/main.ts` mounts the app, registers Pinia and Vue Router
- **Routing**: `src/router/index.ts` — `createWebHistory`, routes array currently empty
- **State**: Pinia stores in `src/stores/` — use the Composition API style (`defineStore` with setup function)
- **Styles**: Tailwind CSS v4 via `@tailwindcss/vite` plugin — no `tailwind.config.js`, configuration lives in CSS
- **Path alias**: `@/` resolves to `src/`

TypeScript is configured with `noUncheckedIndexedAccess: true` — array/object index access returns `T | undefined`.
