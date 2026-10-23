"use client";

import { motion } from "motion/react";
import { useQrStore } from "@/hooks/use-qr-store";
import type { ErrorCorrectionLevel, DotStyle, EyeFrameStyle, EyeBallStyle } from "@/types";
import { Field } from "./input-forms/form-controls";
import { ColorPicker, HexColorInput } from "./color-picker";

const EC_LEVELS: { value: ErrorCorrectionLevel; label: string; desc: string }[] = [
  { value: "L", label: "L", desc: "7%" },
  { value: "M", label: "M", desc: "15%" },
  { value: "Q", label: "Q", desc: "25%" },
  { value: "H", label: "H", desc: "30%" },
];

const DOT_STYLES: { value: DotStyle; label: string; icon: string }[] = [
  { value: "square", label: "Square", icon: "■" },
  { value: "rounded", label: "Rounded", icon: "●" },
  { value: "dots", label: "Dots", icon: "•" },
];

const EYE_FRAME_STYLES: { value: EyeFrameStyle; label: string; icon: string }[] = [
  { value: "square", label: "Square", icon: "■" },
  { value: "rounded", label: "Rounded", icon: "●" },
  { value: "dot", label: "Dots", icon: "●" },
];

const EYE_BALL_STYLES: { value: EyeBallStyle; label: string; icon: string }[] = [
  { value: "square", label: "Square", icon: "■" },
  { value: "dot", label: "Dots", icon: "●" },
];

function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; icon?: string; desc?: string }[];
  value: T;
  onChange: (v: T) => void;
  /** Accessible name for the group (screen readers announce "… group"). */
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1 rounded-md px-2.5 py-2 text-xs font-medium transition-all ${
              isActive
                ? "bg-bg-elevated border border-border-strong text-text-primary"
                : "bg-bg-page border border-border-subtle text-text-primary/60 hover:text-text-primary/80"
            }`}
          >
            {opt.icon && <span className="text-sm">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.desc && (
              <span className="ml-0.5 text-[11px] text-text-muted">{opt.desc}</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function CustomizationPanel() {
  const customization = useQrStore((s) => s.customization);
  const setCustomization = useQrStore((s) => s.setCustomization);

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xs font-semibold text-text-primary/60">
        Customize QR
      </h3>

      <div className="flex flex-col gap-5">
        <Field label="Size" htmlFor="qr-size">
          <div className="flex items-center gap-3">
            <input
              id="qr-size"
              type="range"
              min={128}
              max={320}
              step={8}
              value={Math.min(customization.size, 320)}
              onChange={(e) => setCustomization({ size: Number(e.target.value) })}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
            />
            <span className="w-12 text-right font-mono text-xs text-text-primary/60">
              {customization.size}px
            </span>
          </div>
        </Field>

        <div className="border-t border-border-subtle" />

        <Field label="Error correction">
          <ButtonGroup
            options={EC_LEVELS}
            value={customization.errorCorrectionLevel}
            onChange={(v) => setCustomization({ errorCorrectionLevel: v })}
            label="Error correction level"
          />
        </Field>

        <div className="border-t border-border-subtle" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Foreground">
            <div className="flex items-center gap-1.5">
              <ColorPicker
                label="foreground"
                value={customization.foregroundColor}
                onChange={(c) => setCustomization({ foregroundColor: c })}
              />
              <HexColorInput
                label="foreground"
                value={customization.foregroundColor}
                onChange={(c) => setCustomization({ foregroundColor: c })}
              />
            </div>
          </Field>
          <Field label="Background">
            <div className="flex items-center gap-1.5">
              <ColorPicker
                label="background"
                value={customization.backgroundColor}
                onChange={(c) => setCustomization({ backgroundColor: c })}
              />
              <HexColorInput
                label="background"
                value={customization.backgroundColor}
                onChange={(c) => setCustomization({ backgroundColor: c })}
              />
            </div>
          </Field>
        </div>

        <div className="border-t border-border-subtle" />

        <Field label="Dot style">
          <ButtonGroup
            options={DOT_STYLES}
            value={customization.dotStyle}
            onChange={(v) => setCustomization({ dotStyle: v })}
            label="Dot style"
          />
        </Field>

        <Field label="Eye frame style">
          <ButtonGroup
            options={EYE_FRAME_STYLES}
            value={customization.eyeFrameStyle}
            onChange={(v) => setCustomization({ eyeFrameStyle: v })}
            label="Eye frame style"
          />
        </Field>

        <Field label="Eye ball style">
          <ButtonGroup
            options={EYE_BALL_STYLES}
            value={customization.eyeBallStyle}
            onChange={(v) => setCustomization({ eyeBallStyle: v })}
            label="Eye ball style"
          />
        </Field>

        <div className="border-t border-border-subtle" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-primary/60">
            Quiet zone
          </span>
          <button
            onClick={() =>
              setCustomization({ quietZone: !customization.quietZone })
            }
            className={`relative h-6 w-10 rounded-md transition-all duration-200 ${
              customization.quietZone
                ? "bg-text-primary/30"
                : "bg-text-primary/15"
            }`}
            role="switch"
            aria-checked={customization.quietZone}
            aria-label="Quiet zone"
          >
            <span
              className={`absolute top-1 left-1 h-4 w-4 rounded-md bg-text-primary transition-transform duration-200 ${
                customization.quietZone ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
