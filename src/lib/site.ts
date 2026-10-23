// Single source of truth for the site's canonical origin.
// Set NEXT_PUBLIC_SITE_URL in the environment (e.g. https://quickqr.com)
// before deploying; the fallback keeps local dev and previews working.

const FALLBACK_SITE_URL = "https://quickqr.example.com";

// A scheme only counts if it's followed by "://" — so "localhost:3000" is
// treated as a bare host (and gets https://) rather than a custom scheme.
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

// Never hands an unparseable value to `new URL()` (app/layout.tsx metadataBase
// throws at module evaluation otherwise). Normalizes what it can and falls back
// on anything it can't:
//   "" / "   "        → unset (e.g. an unconfigured Docker build arg)
//   quickqr.dev       → https://quickqr.dev
//   '"https://x.dev"' → https://x.dev  (quoted .env value)
//   https://x.dev/    → https://x.dev  (no trailing slash for string consumers)
//   "https://" / junk → fallback + a server-side warning
function resolveSiteUrl(raw: string | undefined): string {
  const cleaned = (raw ?? "").trim().replace(/^["']|["']$/g, "");
  if (!cleaned) return FALLBACK_SITE_URL;

  const candidate = HAS_SCHEME.test(cleaned) ? cleaned : `https://${cleaned}`;
  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    // Only warn where it's actionable: during build / on the server, not in
    // every browser console of every visitor.
    if (typeof window === "undefined") {
      console.warn(
        `[site] NEXT_PUBLIC_SITE_URL=${JSON.stringify(raw)} is not a valid URL — using ${FALLBACK_SITE_URL}`,
      );
    }
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = "QuickQR";
