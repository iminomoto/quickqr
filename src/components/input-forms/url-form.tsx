"use client";

import { useQrFields, useQrStore } from "@/hooks/use-qr-store";
import { Field, Input } from "./form-controls";

export function UrlForm() {
  const fields = useQrFields("url");
  const updateField = useQrStore((s) => s.updateField);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Web address" hint="Protocol is added automatically if missing" htmlFor="qr-url">
        <Input
          id="qr-url"
          placeholder="https://example.com"
          value={fields.url}
          onChange={(e) => updateField("url", e.target.value)}
        />
      </Field>
      <Field label="Label (optional)" htmlFor="qr-url-title">
        <Input
          id="qr-url-title"
          placeholder="My website"
          value={fields.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </Field>
    </div>
  );
}
