import type { QrCustomization } from "../types";

// Black-on-white is the reliably scannable polarity — many scanners reject
// light-on-dark codes, so it must not be the default (users can still pick it,
// in which case getScannabilityWarnings() flags it).
export const DEFAULT_CUSTOMIZATION: QrCustomization = {
  size: 256,
  errorCorrectionLevel: "M",
  foregroundColor: "#000000",
  backgroundColor: "#ffffff",
  dotStyle: "square",
  eyeFrameStyle: "square",
  eyeBallStyle: "square",
  quietZone: true,
};

const HEX3_RE = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX6_RE = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

function parseHexColor(hex: string): [number, number, number] | null {
  const m6 = HEX6_RE.exec(hex);
  if (m6) {
    return [m6[1], m6[2], m6[3]].map((c) => parseInt(c, 16)) as [number, number, number];
  }
  const m3 = HEX3_RE.exec(hex);
  if (m3) {
    return m3
      .slice(1)
      .map((c) => parseInt(c + c, 16)) as [number, number, number];
  }
  return null;
}

function channelLuminance(c255: number): number {
  const c = c255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// WCAG relative luminance (0 = black, 1 = white).
export function relativeLuminance(hex: string): number | null {
  const rgb = parseHexColor(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(channelLuminance);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG contrast ratio (1..21). Null if either color is unparseable.
export function contrastRatio(fg: string, bg: string): number | null {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  if (a === null || b === null) return null;
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// Below this ratio, camera-based scanners start failing in ordinary lighting.
const MIN_CONTRAST_RATIO = 3;

// Best-effort scannability advice for the current colors / layout. Returned as
// warnings (never errors) — the code still renders, it just may not scan.
export function getScannabilityWarnings(
  foregroundColor: string,
  backgroundColor: string,
  quietZone: boolean,
): string[] {
  const warnings: string[] = [];
  const fgLum = relativeLuminance(foregroundColor);
  const bgLum = relativeLuminance(backgroundColor);

  if (fgLum !== null && bgLum !== null) {
    // Light modules on a dark background: many scanners invert or reject.
    if (fgLum > bgLum) {
      warnings.push("Light-on-dark QR codes aren't recognized by every scanner");
    }
    const ratio = contrastRatio(foregroundColor, backgroundColor);
    if (ratio !== null && ratio < MIN_CONTRAST_RATIO) {
      warnings.push(
        `Low contrast (${ratio.toFixed(1)}:1) — some scanners may fail`,
      );
    }
  }

  if (!quietZone) {
    warnings.push("Quiet zone is off — leave a margin around the code for reliable scanning");
  }

  return warnings;
}
