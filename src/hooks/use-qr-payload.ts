"use client";

import { useMemo, useDeferredValue } from "react";
import { useQrStore } from "./use-qr-store";
import { buildPayload, validatePayload } from "@/lib/payload-builders";
import { generateMatrix, renderQrSvg } from "@/lib/qr-renderer";
import type { PayloadResult, QrValidation } from "@/types";

export interface QrPayloadResult {
  payload: PayloadResult;
  validation: QrValidation;
  /** True when there's a non-empty, valid payload worth rendering/exporting. */
  hasContent: boolean;
  /** Rendered SVG string, or null when there's nothing valid to render. */
  svgString: string | null;
}

// Single source of truth for the payload → validate → render pipeline. Replaces
// the logic that was previously duplicated across the preview, export, and
// payload-preview panels (each keystroke now builds the payload once, not 3×,
// and the QR matrix/ SVG at most once).
export function useQrPayload(): QrPayloadResult {
  const activeType = useQrStore((s) => s.activeType);
  const fields = useQrStore((s) => s.fields[s.activeType]);
  const customization = useQrStore((s) => s.customization);

  const payload = useMemo(
    () => buildPayload(activeType, fields),
    [activeType, fields],
  );

  const validation = useMemo(
    () =>
      validatePayload(
        activeType,
        fields,
        payload.value,
        customization.errorCorrectionLevel,
      ),
    [
      activeType,
      fields,
      payload.value,
      customization.errorCorrectionLevel,
    ],
  );

  const hasContent = payload.value.length > 0 && validation.valid;

  // Defer the (potentially heavy) matrix generation + SVG assembly so typing on
  // large payloads (long text / vCard) stays responsive. The QR simply shows the
  // previous frame for a beat instead of blocking each keystroke.
  const deferredValue = useDeferredValue(payload.value);

  const svgString = useMemo(() => {
    if (!hasContent) return null;
    const matrix = generateMatrix(deferredValue, customization.errorCorrectionLevel);
    if (!matrix) return null;
    return renderQrSvg(matrix, {
      size: customization.size,
      fg: customization.foregroundColor,
      bg: customization.backgroundColor,
      dotStyle: customization.dotStyle,
      eyeFrameStyle: customization.eyeFrameStyle,
      eyeBallStyle: customization.eyeBallStyle,
      quietZone: customization.quietZone,
    });
  }, [
    hasContent,
    deferredValue,
    customization.size,
    customization.foregroundColor,
    customization.backgroundColor,
    customization.errorCorrectionLevel,
    customization.dotStyle,
    customization.eyeFrameStyle,
    customization.eyeBallStyle,
    customization.quietZone,
  ]);

  return { payload, validation, hasContent, svgString };
}
