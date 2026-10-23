"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Clock } from "lucide-react";
import { useQrStore } from "@/hooks/use-qr-store";
import { generateMatrix, renderQrSvg } from "@/lib/qr-renderer";
import type { QrCustomization } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  url: "URL",
  text: "Text",
  email: "Email",
  phone: "Phone",
  wifi: "WiFi",
  vcard: "vCard",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function HistoryThumb({ entry }: { entry: { payload: string; type: string; label: string; customization: QrCustomization } }) {
  const svg = useMemo(() => {
    const matrix = generateMatrix(entry.payload, entry.customization.errorCorrectionLevel);
    if (!matrix) return null;
    return renderQrSvg(matrix, {
      size: 48,
      fg: entry.customization.foregroundColor,
      bg: entry.customization.backgroundColor,
      dotStyle: entry.customization.dotStyle,
      eyeFrameStyle: entry.customization.eyeFrameStyle,
      eyeBallStyle: entry.customization.eyeBallStyle,
      quietZone: false,
    });
  }, [entry.payload, entry.customization]);

  if (!svg) return null;
  return (
    <div
      role="img"
      aria-label={`QR code for ${entry.type}: ${entry.label}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function HistoryStrip() {
  const history = useQrStore((s) => s.history);
  const restoreFromHistory = useQrStore((s) => s.restoreFromHistory);
  const clearHistory = useQrStore((s) => s.clearHistory);

  return (
    <AnimatePresence>
      {history.length > 0 && (
        <motion.div
          key="history-strip"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-bg-surface/50 p-3 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary/60">
              <Clock size={12} />
              Recent
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 rounded-md py-1 px-1.5 text-xs text-text-muted transition-colors hover:text-text-secondary"
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>
          <div className="flex justify-center gap-4 pb-1">
            <AnimatePresence mode="popLayout">
              {history.map((entry) => (
                <motion.button
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  whileHover={{ scale: 1.06 }}
                  onClick={() => restoreFromHistory(entry)}
                  className="glass group flex shrink-0 flex-col items-center gap-2 p-3 transition-all"
                  style={{ width: 104 }}
                >
                  <div className="rounded-lg p-1.5 bg-bg-page border border-border-subtle">
                    <HistoryThumb entry={entry} />
                  </div>
                  <div className="flex flex-col items-center gap-0.5 w-full overflow-hidden">
                    <span className="truncate w-full text-center text-xs font-medium text-text-secondary">
                      {entry.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <span className="rounded-md border border-border-subtle bg-bg-elevated px-1.5 py-px font-mono">
                        {TYPE_LABELS[entry.type]}
                      </span>
                      {timeAgo(entry.timestamp)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
