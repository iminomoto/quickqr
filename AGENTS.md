# AGENTS.md

Single Next.js 16 app (App Router + Turbopack) — a client-side QR generator. No data is sent to any server. No monorepo, no CI, no formatter, no pre-commit hooks.

## Commands

- `npm run dev` — dev server at localhost:3000 (Turbopack)
- `npm run lint` — ESLint flat config; there is no Prettier
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — Vitest (`vitest run`); `npm run test:watch` for watch mode
- Single file: `npx vitest run src/lib/qr-renderer.test.ts`

Verify with `npm run lint && npm run typecheck && npm test`. `npm run build` also typechecks but is slower.

## Layout

- `app/` is at the **repo root**, not `src/app/`: pages, layout, error/not-found, `robots.ts`, `sitemap.ts`, and `og/route.tsx` (edge-runtime OG image — inline SVG only, no fonts loaded there).
- Everything else lives in `src/`: `components/`, `hooks/`, `lib/`, `types/`, `fonts/`.
- Path alias `@/*` → `./src/*`, defined in **both** `tsconfig.json` and `vitest.config.ts` — keep them in sync.
- Tailwind 4 via `@tailwindcss/postcss`. There is no `tailwind.config.*`; the theme is the `@theme` block in `app/globals.css` (custom tokens like `bg-bg-page`, `text-text-muted`, `glass-strong`, `btn-primary`).
- ESLint uses `react-refresh.configs.vite`, which flags non-component exports in component files (see the disable comment above `metadata` in `app/layout.tsx`). Expect the same when exporting constants alongside components.

## QR pipeline (never duplicate it)

Form fields (Zustand) → `src/lib/payload-builders.ts` (`buildPayload` / `validatePayload` / `parsePayloadToFields`) → `src/lib/qr-renderer.ts` (`generateMatrix` + `renderQrSvg`, returns an SVG *string*) → `useQrPayload()` in `src/hooks/use-qr-payload.ts`, which memoizes/defers the work.

- `useQrPayload` is the only place that runs payload → validate → render. Preview, export, and payload-preview all consume it; don't rebuild the chain in a component.
- `validatePayload(type, fields, value?, ecLevel?)` is ECC-aware: `MAX_CAPACITY_BYTES` in `payload-builders.ts` mirrors what `generateMatrix` can encode, so an over-capacity payload is an **error** (exports disable, history refuses it) and a dense one is a **warning**. Keep any new call site passing the active `errorCorrectionLevel`.
- `qr-renderer.ts` uses `QRCode.create()` for the matrix only — never `qrcode.toDataURL`/`toFile`. It merges all modules into 3 `<path>` groups (data dots, eye frames, eye balls); preserve that when adding styles.
- Adding a QR type touches: `src/types/index.ts` (`QrType` is derived from `QrFieldsMap` keys), all three switches in `payload-builders.ts`, `DEFAULT_FIELDS` in `use-qr-store.ts`, and a new form in `src/components/input-forms/`.

## State

Zustand store in `src/hooks/use-qr-store.ts`, persisted to localStorage as `qr-history`.

- Persisted state is versioned (`version: 1`) with a `migrate()` fn. If you change the persisted shape, bump the version and add a migration instead of reshaping in place.
- Rendering is gated on `_hasHydrated` + `useMounted` in `qr-app.tsx`; rendering store-driven UI earlier causes hydration mismatches.
- History: max 5 entries, deduped by (type, payload), invalid payloads never saved.

## Testing

- Vitest runs in a **node** environment (`vitest.config.ts`): no jsdom, so no DOM/component tests today. Tests are colocated (`src/**/*.test.ts`) and must explicitly import `describe`/`it`/`expect` from `vitest` (`globals: false`).
- `use-qr-store.test.ts` prints zustand "storage currently unavailable" warnings — expected in the node env, not a failure.

## Env & Docker

- `NEXT_PUBLIC_SITE_URL` sets the canonical origin for metadata/sitemap/OG; falls back to `https://quickqr.example.com`. `src/lib/site.ts` is the single source of truth.
- It is inlined **at build time**: the Dockerfile declares `ARG NEXT_PUBLIC_SITE_URL` (build/dev stages) and compose passes it through — copy `.env.example` to `.env` (git-ignored) so compose picks it up.
- `src/lib/site.ts` sanitizes the value (empty → unset, adds a missing `https://`, strips quotes/slashes) and falls back to the placeholder instead of throwing — compose passes `""` when nothing is configured, and `new URL()` in `app/layout.tsx` would crash at module evaluation. Don't read `process.env.NEXT_PUBLIC_SITE_URL` anywhere else.
- Security headers (incl. a production-only CSP) live in `next.config.ts` `headers()`. Verify new external scripts/fonts/images against the CSP before adding them.
- Prod: `docker compose up prod` (multi-stage, `output: "standalone"`). Dev: `docker compose --profile dev up app` (bind-mounts `./src` and `./app`).
