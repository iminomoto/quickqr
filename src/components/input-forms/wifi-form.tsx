"use client";

import { motion } from "motion/react";
import { useQrFields, useQrStore } from "@/hooks/use-qr-store";
import type { WifiSecurity } from "@/types";
import { Field, Input } from "./form-controls";

const SECURITY_OPTIONS: { value: WifiSecurity; label: string }[] = [
  { value: "WPA", label: "WPA" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "None" },
];

export function WifiForm() {
  const fields = useQrFields("wifi");
  const updateField = useQrStore((s) => s.updateField);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Network name (SSID)" htmlFor="qr-wifi-ssid">
        <Input
          id="qr-wifi-ssid"
          placeholder="My Network"
          value={fields.ssid}
          onChange={(e) => updateField("ssid", e.target.value)}
        />
      </Field>
      <Field label="Security">
        <div role="radiogroup" aria-label="Security" className="flex gap-1">
          {SECURITY_OPTIONS.map((opt) => {
            const isActive = fields.security === opt.value;
            return (
              <motion.button
                key={opt.value}
                role="radio"
                aria-checked={isActive}
                onClick={() => updateField("security", opt.value)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-bg-elevated border border-border-strong text-text-primary"
                    : "bg-bg-page border border-border-subtle text-text-primary/60 hover:text-text-primary/80"
                }`}
              >
                {opt.label}
              </motion.button>
            );
          })}
        </div>
      </Field>
      {fields.security !== "nopass" && (
        <Field label="Password" htmlFor="qr-wifi-password">
          <Input
            id="qr-wifi-password"
            type="password"
            placeholder="••••••••"
            value={fields.password}
            onChange={(e) => updateField("password", e.target.value)}
          />
        </Field>
      )}
    </div>
  );
}
