import { describe, it, expect } from "vitest";
import {
  DEFAULT_CUSTOMIZATION,
  contrastRatio,
  relativeLuminance,
  getScannabilityWarnings,
} from "./qr-utils";

describe("DEFAULT_CUSTOMIZATION", () => {
  it("defaults to a reliably scannable dark-on-light code", () => {
    expect(getScannabilityWarnings(
      DEFAULT_CUSTOMIZATION.foregroundColor,
      DEFAULT_CUSTOMIZATION.backgroundColor,
      DEFAULT_CUSTOMIZATION.quietZone,
    )).toHaveLength(0);
  });
});

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1);
  });

  it("expands shorthand hex", () => {
    expect(relativeLuminance("#fff")).toBeCloseTo(1);
    expect(relativeLuminance("#000")).toBeCloseTo(0);
  });

  it("returns null for unparseable input", () => {
    expect(relativeLuminance("#12")).toBeNull();
    expect(relativeLuminance("rebeccapurple")).toBeNull();
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
  });

  it("is 1 for identical colors", () => {
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1);
  });

  it("returns null if either color is invalid", () => {
    expect(contrastRatio("#zzzzzz", "#ffffff")).toBeNull();
  });
});

describe("getScannabilityWarnings", () => {
  it("is quiet for the safe default", () => {
    expect(getScannabilityWarnings("#000000", "#ffffff", true)).toEqual([]);
  });

  it("flags an inverted (light-on-dark) code", () => {
    const w = getScannabilityWarnings("#ffffff", "#000000", true);
    expect(w).toHaveLength(1);
    expect(w[0]).toMatch(/Light-on-dark/);
  });

  it("flags low contrast", () => {
    const w = getScannabilityWarnings("#555555", "#333333", true);
    expect(w.some((x) => /Low contrast/.test(x))).toBe(true);
  });

  it("flags a disabled quiet zone", () => {
    const w = getScannabilityWarnings("#000000", "#ffffff", false);
    expect(w).toHaveLength(1);
    expect(w[0]).toMatch(/Quiet zone/);
  });

  it("stacks multiple warnings", () => {
    // Inverted AND low contrast AND no quiet zone.
    const w = getScannabilityWarnings("#666666", "#555555", false);
    expect(w).toHaveLength(3);
  });

  it("ignores unparseable colors instead of crashing", () => {
    expect(getScannabilityWarnings("oops", "#ffffff", true)).toEqual([]);
  });
});
