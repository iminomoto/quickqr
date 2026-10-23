import type { QrCustomization } from "../types";

export const DEFAULT_CUSTOMIZATION: QrCustomization = {
  size: 256,
  errorCorrectionLevel: "M",
  foregroundColor: "#ededed",
  backgroundColor: "#000000",
  dotStyle: "square",
  eyeFrameStyle: "square",
  eyeBallStyle: "square",
  quietZone: true,
};
