import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const PLACEHOLDER = "https://quickqr.example.com";
const ORIGINAL = process.env.NEXT_PUBLIC_SITE_URL;

// site.ts reads process.env at module evaluation, so each case needs a fresh
// module registry after setting the env var.
async function loadSiteUrl(value?: string): Promise<string> {
  vi.resetModules();
  if (value === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = value;
  const mod = await import("./site");
  return mod.SITE_URL;
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL;
});

describe("SITE_URL", () => {
  it("falls back when the env var is unset", async () => {
    expect(await loadSiteUrl()).toBe(PLACEHOLDER);
  });

  it("treats an empty value as unset (unconfigured Docker build arg)", async () => {
    expect(await loadSiteUrl("")).toBe(PLACEHOLDER);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("treats whitespace as unset", async () => {
    expect(await loadSiteUrl("   ")).toBe(PLACEHOLDER);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("adds https:// when the scheme is missing", async () => {
    expect(await loadSiteUrl("quickqr.dev")).toBe("https://quickqr.dev");
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("keeps an explicit http:// scheme", async () => {
    expect(await loadSiteUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("strips a trailing slash so string consumers don't double up", async () => {
    expect(await loadSiteUrl("https://quickqr.dev/")).toBe("https://quickqr.dev");
  });

  it("keeps a path but still drops the trailing slash", async () => {
    expect(await loadSiteUrl("https://x.dev/base/")).toBe("https://x.dev/base");
  });

  it("unwraps a quoted .env value", async () => {
    expect(await loadSiteUrl('"https://x.dev"')).toBe("https://x.dev");
  });

  it("falls back and warns on an unparseable value", async () => {
    expect(await loadSiteUrl("https://")).toBe(PLACEHOLDER);
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it("falls back and warns on free-form junk", async () => {
    expect(await loadSiteUrl("not a url at all")).toBe(PLACEHOLDER);
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it("never throws, whatever it is given", async () => {
    for (const v of ["https://", "::::", "https:// ex ample.com", "%%%"]) {
      await expect(loadSiteUrl(v)).resolves.toBeTypeOf("string");
    }
  });
});
