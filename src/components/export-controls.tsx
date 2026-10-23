"use client";

import { useCallback, useState } from "react";
import { motion } from "motion/react";
import {
  Copy,
  Share2,
  Check,
  FileImage,
  FileText,
} from "lucide-react";
import { useQrStore } from "@/hooks/use-qr-store";
import { useQrPayload } from "@/hooks/use-qr-payload";

export function ExportControls() {
  const activeType = useQrStore((s) => s.activeType);
  const customization = useQrStore((s) => s.customization);
  const { payload, svgString } = useQrPayload();
  const [copied, setCopied] = useState<string | null>(null);

  const getFilename = useCallback(
    (ext: string) => `qr-${activeType}-${Date.now()}.${ext}`,
    [activeType],
  );

  const handleDownloadSvg = useCallback(() => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getFilename("svg");
    a.click();
    URL.revokeObjectURL(url);
  }, [svgString, getFilename]);

  const handleDownloadPng = useCallback(async () => {
    if (!svgString) return;
    const canvas = document.createElement("canvas");
    const s = customization.size * 2;
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    return new Promise<void>((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, s, s);
        URL.revokeObjectURL(url);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = getFilename("png");
            a.click();
            // Revoke the PNG blob URL once the download is triggered.
            URL.revokeObjectURL(pngUrl);
          }
          resolve();
        }, "image/png");
      };
      img.onerror = () => {
        // Clean up on rasterization failure so the blob URL doesn't leak.
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  }, [svgString, customization.size, getFilename]);

  const handleCopyPayload = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(payload.value);
      setCopied("payload");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* noop */
    }
  }, [payload.value]);

  const handleShare = useCallback(async () => {
    if (!svgString || !navigator.share) return;
    try {
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const file = new File([blob], getFilename("svg"), {
        type: "image/svg+xml",
      });
      // Guard: some browsers reject file shares without canShare support.
      if (navigator.canShare && !navigator.canShare({ files: [file] })) return;
      await navigator.share({ files: [file] });
    } catch {
      /* noop */
    }
  }, [svgString, getFilename]);

  // Gate on the actual render result: if there's no SVG (invalid or over the
  // ECC capacity), every export handler would silently no-op.
  const disabled = !svgString;

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <motion.button
        onClick={handleDownloadPng}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className="btn-primary justify-center group"
      >
        <FileImage size={14} className="group-hover:text-accent" />
        PNG
      </motion.button>
      <motion.button
        onClick={handleDownloadSvg}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className="btn-primary justify-center group"
      >
        <FileText size={14} className="group-hover:text-accent" />
        SVG
      </motion.button>
      <motion.button
        onClick={handleCopyPayload}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className="btn-ghost justify-center group"
      >
        {copied === "payload" ? (
          <Check size={14} className="text-accent" />
        ) : (
          <Copy size={14} className="group-hover:text-accent" />
        )}
        {copied === "payload" ? "Copied" : "Copy text"}
      </motion.button>
      <motion.button
        onClick={handleShare}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className="btn-ghost justify-center group"
      >
        <Share2 size={14} className="group-hover:text-accent" />
        Share
      </motion.button>
    </div>
  );
}
