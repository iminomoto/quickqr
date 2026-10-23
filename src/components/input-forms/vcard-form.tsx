"use client";

import { useQrFields, useQrStore } from "@/hooks/use-qr-store";
import { Field, Input, Textarea } from "./form-controls";

export function VCardForm() {
  const fields = useQrFields("vcard");
  const updateField = useQrStore((s) => s.updateField);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="First name" htmlFor="qr-vcard-firstname">
          <Input
            id="qr-vcard-firstname"
            placeholder="John"
            value={fields.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
        </Field>
        <Field label="Last name" htmlFor="qr-vcard-lastname">
          <Input
            id="qr-vcard-lastname"
            placeholder="Doe"
            value={fields.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Phone" htmlFor="qr-vcard-phone">
        <Input
          id="qr-vcard-phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={fields.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />
      </Field>
      <Field label="Email" htmlFor="qr-vcard-email">
        <Input
          id="qr-vcard-email"
          type="email"
          placeholder="john@example.com"
          value={fields.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </Field>
      <Field label="Website" htmlFor="qr-vcard-website">
        <Input
          id="qr-vcard-website"
          type="url"
          placeholder="https://example.com"
          value={fields.website}
          onChange={(e) => updateField("website", e.target.value)}
        />
      </Field>
      <Field label="Address" htmlFor="qr-vcard-address">
        <Textarea
          id="qr-vcard-address"
          placeholder="123 Main St, City, State, ZIP"
          value={fields.address}
          onChange={(e) => updateField("address", e.target.value)}
        />
      </Field>
    </div>
  );
}
