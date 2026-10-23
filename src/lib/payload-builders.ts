import type {
  QrType,
  QrFields,
  PayloadResult,
  QrValidation,
  UrlFields,
  TextFields,
  EmailFields,
  PhoneFields,
  WifiFields,
  VCardFields,
  ErrorCorrectionLevel,
} from "../types";

// Byte capacity of the largest QR version (40) per error-correction level.
// generateMatrix() returns null above these limits, so validation must check
// against the *active* ECC level — otherwise a payload can validate as fine
// while the renderer silently produces nothing.
export const MAX_CAPACITY_BYTES: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

// Above this fraction of the ECC limit the code becomes very dense and harder
// to scan at small sizes — warn well before hitting the hard error.
const DENSITY_WARNING_RATIO = 0.75;

function urlEncode(str: string): string {
  return encodeURIComponent(str).replace(/%20/g, "+");
}

// Escape a string for embedding in a WIFI: payload per the de-facto WIFI QR spec.
// Backslash must be escaped first so earlier escapes aren't double-processed.
function wifiEscape(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:")
    .replace(/"/g, '\\"');
}

export function buildPayload(
  type: QrType,
  fields: QrFields,
): PayloadResult {
  let value = "";

  switch (type) {
    case "url": {
      const f = fields as UrlFields;
      const url = f.url.trim();
      if (!url) {
        value = "https://";
      } else if (!/^https?:\/\//i.test(url)) {
        value = `https://${url}`;
      } else {
        value = url;
      }
      break;
    }
    case "text": {
      const f = fields as TextFields;
      value = f.text;
      break;
    }
    case "email": {
      const f = fields as EmailFields;
      const parts: string[] = [`mailto:${f.recipient}`];
      const params: string[] = [];
      if (f.subject) params.push(`subject=${urlEncode(f.subject)}`);
      if (f.body) params.push(`body=${urlEncode(f.body)}`);
      if (params.length > 0) parts.push(`?${params.join("&")}`);
      value = parts.join("");
      break;
    }
    case "phone": {
      const f = fields as PhoneFields;
      const cleaned = f.number.replace(/[^+\d]/g, "");
      value = `tel:${cleaned}`;
      break;
    }
    case "wifi": {
      const f = fields as WifiFields;
      const parts = [
        `WIFI:S:${wifiEscape(f.ssid)}`,
        `T:${f.security}`,
      ];
      if (f.security !== "nopass") {
        parts.push(`P:${wifiEscape(f.password)}`);
      }
      value = `${parts.join(";")};;`;
      break;
    }
    case "vcard": {
      const f = fields as VCardFields;
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${f.lastName};${f.firstName}`,
        `FN:${f.firstName} ${f.lastName}`,
      ];
      if (f.phone) lines.push(`TEL;TYPE=CELL:${f.phone}`);
      if (f.email) lines.push(`EMAIL:${f.email}`);
      if (f.website) lines.push(`URL:${f.website}`);
      if (f.address) lines.push(`ADR:;;${f.address}`);
      lines.push("END:VCARD");
      value = lines.join("\n");
      break;
    }
  }

  return {
    value,
    byteLength: new TextEncoder().encode(value).length,
    type,
  };
}

export function validatePayload(
  type: QrType,
  fields: QrFields,
  precomputedValue?: string,
  ecLevel: ErrorCorrectionLevel = "M",
): QrValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (type) {
    case "url": {
      const f = fields as UrlFields;
      if (!f.url.trim()) {
        errors.push("URL is required");
      } else {
        try {
          // Mirror buildPayload's scheme handling exactly so validate and
          // build can't disagree about the final payload.
          const urlStr = /^https?:\/\//i.test(f.url) ? f.url : `https://${f.url}`;
          new URL(urlStr);
        } catch {
          errors.push("Invalid URL format");
        }
      }
      break;
    }
    case "text": {
      const f = fields as TextFields;
      if (!f.text.trim()) errors.push("Text is required");
      break;
    }
    case "email": {
      const f = fields as EmailFields;
      if (!f.recipient.trim()) errors.push("Recipient email is required");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.recipient)) {
        errors.push("Invalid email address");
      }
      break;
    }
    case "phone": {
      const f = fields as PhoneFields;
      if (!f.number.trim()) errors.push("Phone number is required");
      else if (!/^\+?[\d\s\-().]{7,}$/.test(f.number)) {
        errors.push("Invalid phone number");
      }
      break;
    }
    case "wifi": {
      const f = fields as WifiFields;
      if (!f.ssid.trim()) errors.push("Network is required");
      if (f.security !== "nopass" && !f.password.trim()) {
        errors.push("Password is required");
      }
      break;
    }
    case "vcard": {
      const f = fields as VCardFields;
      if (!f.firstName.trim() && !f.lastName.trim()) {
        errors.push("Name is required");
      }
      break;
    }
  }

  const value = precomputedValue ?? buildPayload(type, fields).value;
  const byteLength = new TextEncoder().encode(value).length;
  const capacity = MAX_CAPACITY_BYTES[ecLevel];
  if (byteLength > capacity) {
    errors.push(`Too long for ECC ${ecLevel} — max ${capacity} bytes`);
  } else if (byteLength > Math.floor(capacity * DENSITY_WARNING_RATIO)) {
    warnings.push(
      "Payload is large — the QR will be dense and may be harder to scan at small sizes",
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

// Reverse of wifiEscape — used when parsing a WIFI: payload back into fields
// (legacy history migration / restore).
function wifiUnescape(str: string): string {
  return str.replace(/\\(.)/g, "$1");
}

// Best-effort parse of a stored payload back into its field shape. Used to
// recover `fields` for legacy (pre-v1) history entries that predate field
// snapshots. Newer entries store `fields` directly and don't need this.
export function parsePayloadToFields(type: QrType, payload: string): QrFields {
  switch (type) {
    case "url":
      return { url: payload, title: "" };
    case "text":
      return { text: payload };
    case "email": {
      const [addr, query = ""] = payload.replace(/^mailto:/, "").split("?", 2);
      const params = new URLSearchParams(query);
      return {
        recipient: addr,
        subject: params.get("subject") ?? "",
        body: params.get("body") ?? "",
      };
    }
    case "phone":
      return { number: payload.replace(/^tel:/, "") };
    case "wifi": {
      // Split on unescaped delimiters, then unescape each value.
      const body = payload.replace(/^WIFI:/, "").replace(/;;$/, "");
      const segments = body.split(/(?<!\\);/).filter(Boolean);
      let ssid = "";
      let password = "";
      let security: WifiFields["security"] = "WPA";
      for (const seg of segments) {
        const idx = seg.indexOf(":");
        if (idx < 0) continue;
        const key = seg.slice(0, idx);
        const val = wifiUnescape(seg.slice(idx + 1));
        if (key === "S") ssid = val;
        else if (key === "P") password = val;
        else if (key === "T" && (val === "WPA" || val === "WEP" || val === "nopass")) {
          security = val;
        }
      }
      return { ssid, password, security };
    }
    case "vcard": {
      const line = (prefix: string): string => {
        const match = payload.split("\n").find((l) => l.startsWith(prefix));
        return match ? match.slice(prefix.length) : "";
      };
      const fn = line("FN:");
      const [firstName = "", ...rest] = fn.split(" ");
      return {
        firstName,
        lastName: rest.join(" "),
        phone: line("TEL;TYPE=CELL:"),
        email: line("EMAIL:"),
        website: line("URL:"),
        address: line("ADR:;;"),
      };
    }
    default:
      return { url: "", title: "" };
  }
}
