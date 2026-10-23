import { describe, it, expect, beforeEach } from "vitest";
import { useQrStore } from "./use-qr-store";
import { DEFAULT_CUSTOMIZATION } from "../lib/qr-utils";
import type { QrFieldsMap } from "../types";

function emptyFields(): QrFieldsMap {
  return {
    url: { url: "", title: "" },
    text: { text: "" },
    email: { recipient: "", subject: "", body: "" },
    phone: { number: "" },
    wifi: { ssid: "", password: "", security: "WPA" },
    vcard: { firstName: "", lastName: "", phone: "", email: "", website: "", address: "" },
  };
}

beforeEach(() => {
  useQrStore.setState({
    activeType: "url",
    fields: emptyFields(),
    history: [],
    customization: { ...DEFAULT_CUSTOMIZATION },
  });
});

describe("useQrStore", () => {
  it("rejects saving an invalid entry (bare https://)", () => {
    const s = useQrStore.getState();
    s.setActiveType("url");
    s.updateField("title", "only a title"); // url empty → invalid
    s.addToHistory("");
    expect(useQrStore.getState().history).toHaveLength(0);
  });

  it("saves a valid entry", () => {
    const s = useQrStore.getState();
    s.setActiveType("text");
    s.updateField("text", "hello");
    s.addToHistory("");
    expect(useQrStore.getState().history).toHaveLength(1);
  });

  it("dedupes by (type, payload)", () => {
    const s = useQrStore.getState();
    s.setActiveType("text");
    s.updateField("text", "hello");
    s.addToHistory("");
    useQrStore.getState().addToHistory("");
    expect(useQrStore.getState().history).toHaveLength(1);
  });

  it("labels a URL entry by its title", () => {
    const s = useQrStore.getState();
    s.setActiveType("url");
    s.updateField("url", "example.com");
    s.updateField("title", "My Site");
    s.addToHistory("");
    expect(useQrStore.getState().history[0].label).toBe("My Site");
  });

  it("preserves fields when switching types", () => {
    const s = useQrStore.getState();
    s.setActiveType("url");
    s.updateField("url", "keep.me");
    s.setActiveType("text");
    s.updateField("text", "temp");
    s.setActiveType("url");
    expect(useQrStore.getState().fields.url.url).toBe("keep.me");
    expect(useQrStore.getState().activeType).toBe("url");
  });

  it("restores email subject/body losslessly", () => {
    const s = useQrStore.getState();
    s.setActiveType("email");
    s.updateField("recipient", "a@b.co");
    s.updateField("subject", "Hi");
    s.updateField("body", "there");
    s.addToHistory("");
    const entry = useQrStore.getState().history[0];

    // Mutate, then restore.
    useQrStore.getState().updateField("subject", "changed");
    useQrStore.getState().restoreFromHistory(entry);

    const f = useQrStore.getState().fields.email;
    expect(useQrStore.getState().activeType).toBe("email");
    expect(f.recipient).toBe("a@b.co");
    expect(f.subject).toBe("Hi");
    expect(f.body).toBe("there");
  });

  it("stores a lossless fields snapshot on each entry", () => {
    const s = useQrStore.getState();
    s.setActiveType("wifi");
    s.updateField("ssid", "mynet");
    s.updateField("password", "secret");
    s.addToHistory("");
    const entry = useQrStore.getState().history[0];
    expect(entry.fields).toEqual({ ssid: "mynet", password: "secret", security: "WPA" });
    expect(entry.payload).toBe("WIFI:S:mynet;T:WPA;P:secret;;");
  });

  it("rejects an over-capacity entry at the active ECC level", () => {
    const s = useQrStore.getState();
    s.setActiveType("text");
    // 2500 bytes fits ECC L but exceeds the default M (2331).
    s.updateField("text", "x".repeat(2500));
    s.addToHistory("");
    expect(useQrStore.getState().history).toHaveLength(0);

    // Lowering the ECC level makes the very same payload saveable.
    useQrStore.getState().setCustomization({ errorCorrectionLevel: "L" });
    useQrStore.getState().addToHistory("");
    expect(useQrStore.getState().history).toHaveLength(1);
  });

  it("caps history at 5 entries", () => {
    const s = useQrStore.getState();
    s.setActiveType("text");
    for (let i = 0; i < 7; i++) {
      useQrStore.getState().updateField("text", `msg-${i}`);
      useQrStore.getState().addToHistory("");
    }
    expect(useQrStore.getState().history).toHaveLength(5);
    // Newest first.
    expect(useQrStore.getState().history[0].label).toBe("msg-6");
  });

  it("clears history", () => {
    const s = useQrStore.getState();
    s.setActiveType("text");
    s.updateField("text", "x");
    s.addToHistory("");
    useQrStore.getState().clearHistory();
    expect(useQrStore.getState().history).toHaveLength(0);
  });
});
