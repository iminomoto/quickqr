import * as QRCode from "qrcode";
import type { ErrorCorrectionLevel, DotStyle, EyeFrameStyle, EyeBallStyle } from "../types";

interface QrMatrix {
  data: boolean[][];
  size: number;
}

export function generateMatrix(
  value: string,
  ecLevel: ErrorCorrectionLevel,
): QrMatrix | null {
  try {
    const moduleData = QRCode.create(value, { errorCorrectionLevel: ecLevel });
    const size = moduleData.modules.size;
    const data: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(moduleData.modules.get(r, c) === 1);
      }
      data.push(row);
    }
    return { data, size };
  } catch {
    return null;
  }
}

function isFinderRegion(r: number, c: number, size: number): boolean {
  if (r < 7 && c < 7) return true;
  if (r < 7 && c >= size - 7) return true;
  if (r >= size - 7 && c < 7) return true;
  return false;
}

function isFinderCenter(r: number, c: number, size: number): boolean {
  if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
  if (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) return true;
  if (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4) return true;
  return false;
}

// Each helper returns a path-data *subpath* fragment so all modules of the same
// style can be merged into a single <path> element instead of one node per module.

function squareSub(x: number, y: number, s: number): string {
  return `M${x} ${y}h${s}v${s}h${-s}z`;
}

function roundedRectSub(x: number, y: number, s: number, r: number): string {
  const rr = Math.min(r, s / 2);
  const inner = s - rr * 2;
  return (
    `M${x + rr} ${y}` +
    `h${inner}` +
    `a${rr} ${rr} 0 0 1 ${rr} ${rr}` +
    `v${inner}` +
    `a${rr} ${rr} 0 0 1 ${-rr} ${rr}` +
    `h${-inner}` +
    `a${rr} ${rr} 0 0 1 ${-rr} ${-rr}` +
    `v${-inner}` +
    `a${rr} ${rr} 0 0 1 ${rr} ${-rr}` +
    `z`
  );
}

function circleSub(cx: number, cy: number, r: number): string {
  return (
    `M${cx - r} ${cy}` +
    `a${r} ${r} 0 1 0 ${r * 2} 0` +
    `a${r} ${r} 0 1 0 ${-r * 2} 0` +
    `z`
  );
}

function dotSub(x: number, y: number, s: number, style: DotStyle): string {
  const cx = x + s / 2;
  const cy = y + s / 2;

  switch (style) {
    case "rounded":
      return roundedRectSub(x, y, s, s * 0.3);
    case "dots":
      return circleSub(cx, cy, s * 0.42);
    case "square":
    default:
      return squareSub(x, y, s);
  }
}

function eyeFrameSub(x: number, y: number, s: number, style: EyeFrameStyle): string {
  const cx = x + s / 2;
  const cy = y + s / 2;

  switch (style) {
    case "rounded":
      return roundedRectSub(x, y, s, s * 0.25);
    case "dot":
      return circleSub(cx, cy, s * 0.48);
    case "square":
    default:
      return squareSub(x, y, s);
  }
}

function eyeBallSub(x: number, y: number, s: number, style: EyeBallStyle): string {
  const cx = x + s / 2;
  const cy = y + s / 2;

  switch (style) {
    case "dot":
      return circleSub(cx, cy, s * 0.45);
    case "square":
    default:
      return squareSub(x, y, s);
  }
}

export function renderQrSvg(
  matrix: QrMatrix,
  options: {
    size: number;
    fg: string;
    bg: string;
    dotStyle: DotStyle;
    eyeFrameStyle: EyeFrameStyle;
    eyeBallStyle: EyeBallStyle;
    quietZone: boolean;
    showBackground?: boolean;
  },
): string {
  const { size, fg, bg, dotStyle, eyeFrameStyle, eyeBallStyle, quietZone, showBackground } = options;
  const modules = matrix.data;
  const moduleCount = matrix.size;
  const quiet = quietZone ? 4 : 0;
  const totalModules = moduleCount + quiet * 2;
  const cellSize = size / totalModules;

  const dotSubs: string[] = [];
  const eyeFrameSubs: string[] = [];
  const eyeBallSubs: string[] = [];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!modules[row][col]) continue;

      const x = (col + quiet) * cellSize;
      const y = (row + quiet) * cellSize;
      const inFinder = isFinderRegion(row, col, moduleCount);
      const inCenter = isFinderCenter(row, col, moduleCount);

      if (inFinder) {
        if (inCenter) {
          eyeBallSubs.push(eyeBallSub(x, y, cellSize, eyeBallStyle));
        } else {
          eyeFrameSubs.push(eyeFrameSub(x, y, cellSize, eyeFrameStyle));
        }
      } else {
        dotSubs.push(dotSub(x, y, cellSize, dotStyle));
      }
    }
  }

  const parts: string[] = [];
  if (showBackground !== false) {
    parts.push(`<rect width="${size}" height="${size}" fill="${bg}"/>`);
  }
  // One <path> per style group (data dots, eye frames, eye balls) instead of
  // one element per module — drastically fewer DOM nodes for large QR codes.
  if (dotSubs.length) parts.push(`<path fill="${fg}" d="${dotSubs.join("")}"/>`);
  if (eyeFrameSubs.length) parts.push(`<path fill="${fg}" d="${eyeFrameSubs.join("")}"/>`);
  if (eyeBallSubs.length) parts.push(`<path fill="${fg}" d="${eyeBallSubs.join("")}"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="width:100%;height:100%;display:block">${parts.join("")}</svg>`;
}
