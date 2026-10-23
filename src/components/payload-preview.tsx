"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check } from "lucide-react";
import { useQrStore } from "@/hooks/use-qr-store";
import { useQrPayload } from "@/hooks/use-qr-payload";

export function PayloadPreview() {
  const activeType = useQrStore((s) => s.activeType);
  const { payload, hasContent } = useQrPayload();
  const [copied, setCopied] = useState(false);

  const hasPayload = payload.value.length > 0;
  const isValid = hasContent;

  const handleCopy = useCallback(async () => {
    if (!payload.value) return;
    try {
      await navigator.clipboard.writeText(payload.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }, [payload.value]);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-text-primary/60">
          Encoded payload
        </h3>
        {isValid && (
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
          >
            {copied ? (
              <>
                <Check size={12} />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </motion.button>
        )}
      </div>

      <motion.div layout className="relative flex-1 min-h-[80px] rounded-lg border border-border-subtle bg-bg-page p-3 overflow-hidden">
        <AnimatePresence mode="wait">
          {hasPayload ? (
            <motion.div
              key={payload.value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="font-mono text-xs leading-relaxed text-text-secondary whitespace-pre-wrap break-all"
            >
              {payload.value}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="font-mono text-xs text-text-muted"
            >
              Fill in the form to see the encoded payload
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {isValid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout
            className="flex items-center gap-2 text-[11px] text-text-muted"
          >
            <span className="font-mono">{payload.byteLength} bytes</span>
            <span>·</span>
            <span className="font-mono uppercase">{activeType}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
