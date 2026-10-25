# QuickQR

[![CI](https://github.com/iminomoto/quickqr/actions/workflows/ci.yml/badge.svg)](https://github.com/iminomoto/quickqr/actions/workflows/ci.yml)

Free QR code generator built with Next.js, React, and TypeScript.

Generate custom QR codes for URLs, text, email, phone, WiFi, and vCard with customizable colors, styles, and sizes. Client-side generation — no data sent to a server.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4, Motion (Framer Motion)
- **State**: Zustand with localStorage persistence
- **QR Engine**: `qrcode` library with custom SVG renderer

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The E2E suite needs Playwright's browser on first run:

```bash
npx playwright install chromium
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript (no emit) |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests (builds + starts a server locally; CI reuses the build step) |

## Configuration

Set the canonical site origin (used for metadata, sitemap, robots, and OG URLs).
Defaults to `https://quickqr.example.com` if unset:

```bash
NEXT_PUBLIC_SITE_URL=https://quickqr.example.com
```

It is inlined **at build time**, so it must be set when you build (not just at
runtime). Copy `.env.example` to `.env` to have `docker compose` pick it up
automatically for the image build.

## Docker

```bash
# Configure the canonical origin (read by compose for build args)
cp .env.example .env   # then edit NEXT_PUBLIC_SITE_URL

# Development (published on host port 3001, so it can run beside prod)
docker compose --profile dev up app

# Production (http://localhost:3000, container has a HEALTHCHECK on /)
docker compose up prod --build
```

Production responses include security headers (nosniff, frame denial,
referrer policy, HSTS, and a CSP) configured in `next.config.ts`.

For a full server deployment — Docker install, verification, HTTPS with Caddy,
firewall, day-2 operations, and troubleshooting — see
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Continuous Integration

`.github/workflows/ci.yml` runs `npm ci`, lint, typecheck, unit tests, and a
production build on every push to `main` and every pull request, then installs
Playwright's Chromium and runs the E2E suite against that build.

## Project Structure

```
app/              Next.js App Router pages, error boundaries, sitemap/robots/OG
src/
  components/     React UI components (input-forms/ per QR type)
  hooks/          Zustand store, payload memoization, mount hooks
  lib/            QR payload builders, renderer, utilities, site config
  types/          TypeScript interfaces
  fonts/          Local font files (woff2)
public/           Static assets (favicon, PWA icons, manifest, background image)
e2e/              Playwright specs
docs/             Deployment guide (see docs/DEPLOYMENT.md)
```
