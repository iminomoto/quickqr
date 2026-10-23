"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// A hex text field that only commits valid #rrggbb values to the store, so a
// half-typed value can never reach the SVG renderer. Free-typing is allowed
// locally; invalid input snaps back to the last valid color on blur.
export function HexColorInput({ value, onChange }: ColorPickerProps) {
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Adjust state during render when the color changes elsewhere (e.g. the
  // picker). This is the React-recommended sync-to-prop pattern and avoids a
  // setState-in-effect.
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  return (
    <input
      type="text"
      aria-label="Hex color"
      value={draft}
      onChange={(e) => {
        const v = e.target.value;
        setDraft(v);
        if (HEX_RE.test(v)) onChange(v);
      }}
      onBlur={() => {
        if (!HEX_RE.test(draft)) setDraft(value);
      }}
      className="input-ve font-mono text-xs"
    />
  );
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInputValue(v);
      if (HEX_RE.test(v)) {
        onChange(v);
      }
    },
    [onChange],
  );

  const handleOpen = useCallback(() => {
    setOpen((o) => !o);
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={handleOpen}
        aria-label="Pick color"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border-subtle bg-transparent transition-all hover:scale-110 hover:border-border-strong"
      >
        <div
          className="h-7 w-7 rounded-sm"
          style={{ backgroundColor: value }}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Color picker"
          className="absolute left-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[220px] rounded-lg border border-border-subtle bg-[#141414] p-3 shadow-md"
        >
          <HexColorPicker color={value} onChange={onChange} />
          <input
            type="text"
            aria-label="Hex color"
            value={inputValue}
            onChange={handleInputChange}
            className="input-ve mt-2 w-full text-center font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}
