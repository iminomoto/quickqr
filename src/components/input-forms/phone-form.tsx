"use client";

import { useQrFields, useQrStore } from "@/hooks/use-qr-store";
import { Field, Input } from "./form-controls";

export function PhoneForm() {
  const fields = useQrFields("phone");
  const updateField = useQrStore((s) => s.updateField);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Phone number" hint="Include country code for international numbers" htmlFor="qr-phone-number">
        <Input
          id="qr-phone-number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={fields.number}
          onChange={(e) => updateField("number", e.target.value)}
        />
      </Field>
    </div>
  );
}
