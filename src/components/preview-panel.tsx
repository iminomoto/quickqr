"use client";

import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, TriangleAlert, QrCode } from "lucide-react";
import { useQrStore } from "@/hooks/use-qr-store";
import { useQrPayload } from "@/hooks/use-qr-payload";
import { getScannabilityWarnings } from "@/lib/qr-utils";

export function PreviewPanel() {
  const activeType = useQrStore((s) => s.activeType);
  const customization = useQrStore((s) => s.customization);
  const { payload, validation, svgString } = useQrPayload();

  // Colors / quiet zone can make a rendered code hard or impossible to scan —
  // surface that next to the preview, where the change is visible.
  const scannability = getScannabilityWarnings(
    customization.foregroundColor,
    customization.backgroundColor,
    customization.quietZone,
  );
  const warning = validation.warnings[0] ?? scannability[0];

  const previewMaxSize = 304;
  const displaySize = Math.min(customization.size, previewMaxSize);

  // Key on type + style options (NOT payload value) so the QR doesn't remount
  // and re-animate on every keystroke — content updates in place instead.
  const animKey = [
    activeType,
    customization.errorCorrectionLevel,
    customization.dotStyle,
    customization.eyeFrameStyle,
    customization.eyeBallStyle,
  ].join("|");

  return (
    <div className="relative h-[332px] w-[304px] flex-shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated">
      <div className="flex h-full flex-col">
        {/* QR or empty state — takes remaining space */}
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {svgString ? (
              <motion.div
                key={animKey}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center transition-[width,height] duration-200"
                style={{ width: displaySize, height: displaySize }}
                role="img"
                aria-label={`QR code for ${activeType}`}
                dangerouslySetInnerHTML={{ __html: svgString }}
              />
            ) : payload.value.length > 0 ? (
              // Content exists but couldn't be rendered (e.g. over the ECC
              // capacity limit) — show why, not the "fill in the form" hint.
              <motion.div
                key="unrenderable"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4 px-6 text-center"
              >
                <ShieldAlert size={48} strokeWidth={1} className="text-text-secondary" />
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    {validation.errors[0] ?? "Unable to generate a QR code"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Adjust the form to continue
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <QrCode size={48} strokeWidth={1} className="text-text-secondary" />
                </motion.div>
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    No QR code yet
                  </p>
                  <p className="text-xs text-text-secondary">
                    Fill in the form to generate
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom bar — fixed height, always present, swaps errors/metadata */}
        <div className="h-[28px] shrink-0 overflow-hidden border-t border-border-subtle bg-bg-elevated/90 backdrop-blur-sm">
          {validation.errors.length > 0 ? (
            <div className="flex h-full items-center gap-2 px-3">
              <ShieldAlert size={14} className="shrink-0 text-text-secondary" />
              <p className="truncate text-xs text-text-secondary">{validation.errors[0]}</p>
            </div>
          ) : warning ? (
            <div className="flex h-full items-center gap-2 px-3">
              <TriangleAlert size={14} className="shrink-0 text-text-secondary" />
              <p className="truncate text-xs text-text-secondary">{warning}</p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-between px-3 text-xs text-text-secondary">
              <span className="font-mono font-medium text-text-primary">
                {activeType.toUpperCase()}
              </span>
              <span className="font-mono text-text-primary/60">{payload.byteLength} bytes</span>
              <span className="flex items-center gap-1.5 font-mono text-text-primary/60">
                EC:
                <span className="rounded-md bg-bg-elevated px-1.5 py-0.5 text-text-primary">
                  {customization.errorCorrectionLevel}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
