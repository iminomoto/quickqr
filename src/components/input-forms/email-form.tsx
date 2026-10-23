"use client";

import { useQrFields, useQrStore } from "@/hooks/use-qr-store";
import { Field, Input, Textarea } from "./form-controls";

export function EmailForm() {
  const fields = useQrFields("email");
  const updateField = useQrStore((s) => s.updateField);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Recipient" htmlFor="qr-email-recipient">
        <Input
          id="qr-email-recipient"
          type="email"
          placeholder="recipient@example.com"
          value={fields.recipient}
          onChange={(e) => updateField("recipient", e.target.value)}
        />
      </Field>
      <Field label="Subject (optional)" htmlFor="qr-email-subject">
        <Input
          id="qr-email-subject"
          placeholder="Hello"
          value={fields.subject}
          onChange={(e) => updateField("subject", e.target.value)}
        />
      </Field>
      <Field label="Body (optional)" htmlFor="qr-email-body">
        <Textarea
          id="qr-email-body"
          placeholder="Message content..."
          value={fields.body}
          onChange={(e) => updateField("body", e.target.value)}
        />
      </Field>
    </div>
  );
}
