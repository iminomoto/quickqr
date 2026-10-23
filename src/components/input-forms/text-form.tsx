"use client";

import { useQrFields, useQrStore } from "@/hooks/use-qr-store";
import { Field, Textarea } from "./form-controls";

export function TextForm() {
  const fields = useQrFields("text");
  const updateField = useQrStore((s) => s.updateField);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Text content" htmlFor="qr-text">
        <Textarea
          id="qr-text"
          placeholder="Enter any text to encode..."
          value={fields.text}
          onChange={(e) => updateField("text", e.target.value)}
        />
      </Field>
    </div>
  );
}
