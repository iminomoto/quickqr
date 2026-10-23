import { describe, it, expect } from "vitest";
import { generateMatrix, renderQrSvg } from "./qr-renderer";

const SAMPLE = "https://example.com";

describe("generateMatrix", () => {
  it("returns a square boolean matrix", () => {
    const m = generateMatrix(SAMPLE, "M");
    expect(m).not.toBeNull();
    expect(m!.size).toBeGreaterThan(0);
    expect(m!.data.length).toBe(m!.size);
    expect(m!.data[0].length).toBe(m!.size);
    expect(typeof m!.data[0][0]).toBe("boolean");
  });

  it("is deterministic for the same input", () => {
    const a = generateMatrix(SAMPLE, "M");
    const b = generateMatrix(SAMPLE, "M");
    expect(a!.size).toBe(b!.size);
    expect(a!.data).toEqual(b!.data);
  });

  it("has finder patterns in the three corners", () => {
    const m = generateMatrix(SAMPLE, "M");
    const d = m!.data;
    const s = m!.size;
    // Top-left corner module of a QR is always dark.
    expect(d[0][0]).toBe(true);
    expect(d[0][s - 1]).toBe(true);
    expect(d[s - 1][0]).toBe(true);
  });

  it("returns null for input too large at high EC", () => {
    const huge = "x".repeat(3000);
    expect(generateMatrix(huge, "H")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(generateMatrix("", "M")).toBeNull();
  });
});

describe("renderQrSvg", () => {
  const matrix = generateMatrix(SAMPLE, "M")!;

  const baseOpts = {
    size: 256,
    fg: "#ededed",
    bg: "#000000",
    dotStyle: "square",
    eyeFrameStyle: "square",
    eyeBallStyle: "square",
    quietZone: true,
  } as const;

  it("emits a standalone svg with the correct viewBox", () => {
    const svg = renderQrSvg(matrix, baseOpts);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain(`viewBox="0 0 256 256"`);
  });

  it("includes a background rect by default", () => {
    const svg = renderQrSvg(matrix, baseOpts);
    expect(svg).toContain('fill="#000000"');
  });

  it("omits the background when showBackground is false", () => {
    const svg = renderQrSvg(matrix, { ...baseOpts, showBackground: false });
    // No full-bleed background rect should be present.
    expect(svg).not.toContain('<rect width="256" height="256" fill="#000000"');
  });

  it("renders the foreground color", () => {
    const svg = renderQrSvg(matrix, baseOpts);
    expect(svg).toContain("#ededed");
  });

  it("produces far fewer nodes than one-per-module", () => {
    // The renderer now merges modules into a small number of <path> elements.
    const svg = renderQrSvg(matrix, baseOpts);
    const pathCount = (svg.match(/<path/g) ?? []).length;
    const rectCount = (svg.match(/<rect/g) ?? []).length;
    // At most a handful of paths (dots + eye frames + eye balls) + 1 bg rect.
    expect(pathCount).toBeLessThanOrEqual(4);
    expect(rectCount).toBeLessThanOrEqual(1);
  });

  it("emits different geometry for different dot styles", () => {
    const square = renderQrSvg(matrix, { ...baseOpts, dotStyle: "square" });
    const dots = renderQrSvg(matrix, { ...baseOpts, dotStyle: "dots" });
    expect(square).not.toBe(dots);
  });

  it("toggles quiet zone without changing the viewBox", () => {
    const withQz = renderQrSvg(matrix, { ...baseOpts, quietZone: true });
    const withoutQz = renderQrSvg(matrix, { ...baseOpts, quietZone: false });
    expect(withQz).toContain('viewBox="0 0 256 256"');
    expect(withoutQz).toContain('viewBox="0 0 256 256"');
    expect(withQz).not.toBe(withoutQz);
  });
});
