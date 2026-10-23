"use client";

import { useCallback, useRef, useState } from "react";
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
import { useMounted } from "@/hooks/use-mounted";

type DoneKey = "png" | "svg" | "payload";

export function ExportControls() {
  const activeType = useQrStore((s) => s.activeType);
  const customization = useQrStore((s) => s.customization);
  const { payload, svgString } = useQrPayload();
  const mounted = useMounted();
  const [done, setDone] = useState<DoneKey | null>(null);
  // Announced via the role="status" live region below (visual feedback alone
  // is invisible to screen-reader users).
  const [status, setStatus] = useState("");
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Brief "Saved"/"Copied" state on the button + a spoken confirmation.
  const flash = useCallback((key: DoneKey, message: string) => {
    setDone(key);
    setStatus(message);
    if (doneTimer.current) clearTimeout(doneTimer.current);
    doneTimer.current = setTimeout(() => setDone(null), 2000);
  }, []);

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
    flash("svg", "QR code downloaded as SVG");
  }, [svgString, getFilename, flash]);

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
            flash("png", "QR code downloaded as PNG");
          } else {
            setStatus("PNG export failed — try SVG instead");
          }
          resolve();
        }, "image/png");
      };
      img.onerror = () => {
        // Clean up on rasterization failure so the blob URL doesn't leak.
        URL.revokeObjectURL(url);
        setStatus("PNG export failed — try SVG instead");
        resolve();
      };
      img.src = url;
    });
  }, [svgString, customization.size, getFilename, flash]);

  const handleCopyPayload = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(payload.value);
      flash("payload", "QR code text copied to clipboard");
    } catch {
      setStatus("Could not copy to clipboard");
    }
  }, [payload.value, flash]);

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
  // Share is a Web Share API feature — hide the button where it doesn't exist
  // instead of showing a button that can only fail. Deferred to after mount so
  // the server HTML and first client render agree.
  const canShare = mounted && typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <span role="status" className="sr-only">
        {status}
      </span>
      <motion.button
        onClick={handleDownloadPng}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className="btn-primary justify-center group"
      >
        {done === "png" ? (
          <Check size={14} className="text-accent" />
        ) : (
          <FileImage size={14} className="group-hover:text-accent" />
        )}
        {done === "png" ? "Saved" : "PNG"}
      </motion.button>
      <motion.button
        onClick={handleDownloadSvg}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className="btn-primary justify-center group"
      >
        {done === "svg" ? (
          <Check size={14} className="text-accent" />
        ) : (
          <FileText size={14} className="group-hover:text-accent" />
        )}
        {done === "svg" ? "Saved" : "SVG"}
      </motion.button>
      <motion.button
        onClick={handleCopyPayload}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className={`btn-ghost justify-center group ${canShare ? "" : "col-span-2"}`}
      >
        {done === "payload" ? (
          <Check size={14} className="text-accent" />
        ) : (
          <Copy size={14} className="group-hover:text-accent" />
        )}
        {done === "payload" ? "Copied" : "Copy text"}
      </motion.button>
      {canShare && (
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
      )}
    </div>
  );
}
