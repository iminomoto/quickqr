import { describe, it, expect } from "vitest";
import { buildPayload, validatePayload } from "./payload-builders";
import { generateMatrix } from "./qr-renderer";
import type { WifiFields, EmailFields, VCardFields } from "../types";

describe("buildPayload", () => {
  describe("url", () => {
    it("defaults to https:// when empty", () => {
      expect(buildPayload("url", { url: "", title: "" }).value).toBe("https://");
    });

    it("prepends https:// when protocol missing", () => {
      expect(buildPayload("url", { url: "example.com", title: "" }).value).toBe(
        "https://example.com",
      );
    });

    it("keeps an explicit http:// protocol", () => {
      expect(buildPayload("url", { url: "http://example.com", title: "" }).value).toBe(
        "http://example.com",
      );
    });

    it("keeps an explicit https:// protocol", () => {
      expect(buildPayload("url", { url: "https://example.com/a?b=1", title: "" }).value).toBe(
        "https://example.com/a?b=1",
      );
    });

    it("trims surrounding whitespace", () => {
      expect(buildPayload("url", { url: "  example.com  ", title: "" }).value).toBe(
        "https://example.com",
      );
    });

    it("computes byteLength and type", () => {
      const r = buildPayload("url", { url: "https://a.co", title: "" });
      expect(r.byteLength).toBe("https://a.co".length);
      expect(r.type).toBe("url");
    });

    it("byteLength counts multi-byte chars", () => {
      const r = buildPayload("text", { text: "héllo" }); // é is 2 bytes in UTF-8
      expect(r.byteLength).toBe(6);
    });
  });

  describe("text", () => {
    it("passes text through", () => {
      expect(buildPayload("text", { text: "hello world" }).value).toBe("hello world");
    });
  });

  describe("email", () => {
    const email = (e: Partial<EmailFields>): EmailFields => ({
      recipient: "",
      subject: "",
      body: "",
      ...e,
    });

    it("builds a bare mailto", () => {
      expect(buildPayload("email", email({ recipient: "a@b.co" })).value).toBe("mailto:a@b.co");
    });

    it("encodes the subject (spaces to +)", () => {
      expect(buildPayload("email", email({ recipient: "a@b.co", subject: "Hello World" })).value).toBe(
        "mailto:a@b.co?subject=Hello+World",
      );
    });

    it("encodes the body and joins subject & body", () => {
      expect(
        buildPayload("email", email({ recipient: "a@b.co", subject: "Hi", body: "line one" })).value,
      ).toBe("mailto:a@b.co?subject=Hi&body=line+one");
    });
  });

  describe("phone", () => {
    it("strips formatting, keeps leading +", () => {
      expect(buildPayload("phone", { number: "+1 (555) 123-4567" }).value).toBe("tel:+15551234567");
    });
  });

  describe("wifi", () => {
    const base: WifiFields = { ssid: "mynet", password: "secret", security: "WPA" };

    it("builds a WPA payload with password", () => {
      expect(buildPayload("wifi", base).value).toBe("WIFI:S:mynet;T:WPA;P:secret;;");
    });

    it("omits the password for nopass", () => {
      expect(buildPayload("wifi", { ssid: "mynet", password: "", security: "nopass" }).value).toBe(
        "WIFI:S:mynet;T:nopass;;",
      );
    });

    it("escapes a semicolon in the SSID", () => {
      expect(buildPayload("wifi", { ...base, ssid: "my;net" }).value).toBe(
        String.raw`WIFI:S:my\;net;T:WPA;P:secret;;`,
      );
    });

    it("escapes semicolon and comma in the password", () => {
      expect(buildPayload("wifi", { ...base, password: "p;ass,word" }).value).toBe(
        String.raw`WIFI:S:mynet;T:WPA;P:p\;ass\,word;;`,
      );
    });

    it("escapes double-quote and backslash", () => {
      expect(buildPayload("wifi", { ...base, password: 'a"b\\c' }).value).toBe(
        String.raw`WIFI:S:mynet;T:WPA;P:a\"b\\c;;`,
      );
    });

    it("escapes a colon", () => {
      expect(buildPayload("wifi", { ...base, password: "x:y" }).value).toBe(
        String.raw`WIFI:S:mynet;T:WPA;P:x\:y;;`,
      );
    });

    it("escapes a lone backslash", () => {
      expect(buildPayload("wifi", { ...base, password: "a\\b" }).value).toBe(
        String.raw`WIFI:S:mynet;T:WPA;P:a\\b;;`,
      );
    });
  });

  describe("vcard", () => {
    const full: VCardFields = {
      firstName: "John",
      lastName: "Doe",
      phone: "+15551234567",
      email: "john@example.com",
      website: "https://example.com",
      address: "123 Main St",
    };

    it("builds a full vCard 3.0", () => {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Doe;John",
        "FN:John Doe",
        "TEL;TYPE=CELL:+15551234567",
        "EMAIL:john@example.com",
        "URL:https://example.com",
        "ADR:;;123 Main St",
        "END:VCARD",
      ];
      expect(buildPayload("vcard", full).value).toBe(lines.join("\n"));
    });

    it("omits optional lines when empty", () => {
      const lines = ["BEGIN:VCARD", "VERSION:3.0", "N:Doe;John", "FN:John Doe", "END:VCARD"];
      expect(
        buildPayload("vcard", {
          firstName: "John",
          lastName: "Doe",
          phone: "",
          email: "",
          website: "",
          address: "",
        }).value,
      ).toBe(lines.join("\n"));
    });
  });
});

describe("validatePayload", () => {
  it("flags a missing URL", () => {
    const v = validatePayload("url", { url: "", title: "" });
    expect(v.valid).toBe(false);
    expect(v.errors).toContain("URL is required");
  });

  it("accepts a bare domain", () => {
    expect(validatePayload("url", { url: "example.com", title: "" }).valid).toBe(true);
  });

  it("flags missing text", () => {
    expect(validatePayload("text", { text: "  " }).valid).toBe(false);
  });

  it("validates email format", () => {
    expect(validatePayload("email", { recipient: "nope", subject: "", body: "" }).valid).toBe(false);
    expect(validatePayload("email", { recipient: "a@b.co", subject: "", body: "" }).valid).toBe(
      true,
    );
  });

  it("requires a wifi password unless nopass", () => {
    const fields: WifiFields = { ssid: "n", password: "", security: "WPA" };
    expect(validatePayload("wifi", fields).valid).toBe(false);
    expect(validatePayload("wifi", { ssid: "n", password: "", security: "nopass" }).valid).toBe(
      true,
    );
  });

  it("requires a vCard name", () => {
    const empty: VCardFields = {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      website: "",
      address: "",
    };
    expect(validatePayload("vcard", empty).valid).toBe(false);
    expect(validatePayload("vcard", { ...empty, firstName: "A" }).valid).toBe(true);
  });

  it("warns when the payload is large but still renderable", () => {
    // 75% of ECC L (2215) < 2500 <= 2953
    const v = validatePayload("text", { text: "x".repeat(2500) }, undefined, "L");
    expect(v.valid).toBe(true);
    expect(v.warnings.length).toBeGreaterThan(0);
  });

  it("does not warn on small payloads", () => {
    expect(validatePayload("text", { text: "hello" }).warnings).toHaveLength(0);
  });
});

describe("validatePayload capacity limits", () => {
  // Fits at ECC L (2953 bytes) but exceeds M (2331), Q (1663) and H (1273).
  const big = "x".repeat(2500);

  it("rejects payloads over the active ECC limit", () => {
    for (const level of ["M", "Q", "H"] as const) {
      const v = validatePayload("text", { text: big }, undefined, level);
      expect(v.valid).toBe(false);
      expect(v.errors[0]).toContain(`Too long for ECC ${level}`);
    }
  });

  it("accepts the same payload at ECC L", () => {
    expect(validatePayload("text", { text: big }, undefined, "L").valid).toBe(true);
  });

  it("matches what the renderer can actually encode", () => {
    // A payload must validate exactly when generateMatrix can render it —
    // otherwise exports enable with no-op handlers.
    const cases = [
      { text: big, level: "M" as const },
      { text: big, level: "L" as const },
      { text: "x".repeat(2400), level: "M" as const },
      { text: "hello", level: "H" as const },
    ];
    for (const c of cases) {
      const valid = validatePayload("text", { text: c.text }, undefined, c.level).valid;
      expect(valid).toBe(generateMatrix(c.text, c.level) !== null);
    }
  });
});
