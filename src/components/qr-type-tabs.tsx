"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import {
  Link,
  Type,
  Mail,
  Phone,
  Wifi,
  Contact,
  type LucideIcon,
} from "lucide-react";
import type { QrType } from "@/types";
import { useQrStore } from "@/hooks/use-qr-store";

interface Tab {
  id: QrType;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { id: "url", label: "URL", icon: Link },
  { id: "text", label: "Text", icon: Type },
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "vcard", label: "vCard", icon: Contact },
];

export function QrTypeTabs() {
  const activeType = useQrStore((s) => s.activeType);
  const setActiveType = useQrStore((s) => s.setActiveType);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // WAI-ARIA tabs keyboard support: Left/Right to move, Home/End to jump.
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const n = TABS.length;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (idx + 1) % n;
    else if (e.key === "ArrowLeft") next = (idx - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    setActiveType(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <nav aria-label="QR code type">
      <motion.div
        role="tablist"
        aria-label="QR code type"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mx-auto flex max-w-fit gap-1 rounded-lg border border-border-subtle bg-bg-surface p-1 overflow-x-auto scrollbar-none"
      >
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              role="tab"
              id={`qr-tab-${tab.id}`}
              aria-selected={isActive}
              // Only the active panel exists in the DOM, so only reference it
              // from the active tab to avoid dangling aria-controls ids.
              aria-controls={isActive ? `panel-${tab.id}` : undefined}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveType(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="relative flex items-center gap-1.5 rounded-md px-3 py-2.5 text-xs font-medium transition-colors"
              style={{
                color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-md bg-bg-elevated border border-border-subtle"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon size={14} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </motion.div>
    </nav>
  );
}
