"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  QrType,
  QrFields,
  QrFieldsMap,
  QrCustomization,
  HistoryEntry,
  UrlFields,
  EmailFields,
  PhoneFields,
  WifiFields,
  VCardFields,
} from "../types";
import { DEFAULT_CUSTOMIZATION } from "../lib/qr-utils";
import {
  buildPayload,
  validatePayload,
  parsePayloadToFields,
} from "../lib/payload-builders";

const DEFAULT_FIELDS: QrFieldsMap = {
  url: { url: "", title: "" },
  text: { text: "" },
  email: { recipient: "", subject: "", body: "" },
  phone: { number: "" },
  wifi: { ssid: "", password: "", security: "WPA" },
  vcard: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    website: "",
    address: "",
  },
};

function defaultFields(): QrFieldsMap {
  return {
    url: { ...DEFAULT_FIELDS.url },
    text: { ...DEFAULT_FIELDS.text },
    email: { ...DEFAULT_FIELDS.email },
    phone: { ...DEFAULT_FIELDS.phone },
    wifi: { ...DEFAULT_FIELDS.wifi },
    vcard: { ...DEFAULT_FIELDS.vcard },
  };
}

// crypto.randomUUID() requires a secure context; fall back to a timestamp +
// random id so the app still works over plain http on a LAN.
function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// A human-friendly label for a history entry, derived from the most meaningful
// field for each type. Falls back to the raw payload in addToHistory.
function deriveLabel(type: QrType, fields: QrFields): string {
  switch (type) {
    case "url":
      return (fields as UrlFields).title.trim();
    case "email":
      return (fields as EmailFields).recipient.trim();
    case "phone":
      return (fields as PhoneFields).number.trim();
    case "wifi":
      return (fields as WifiFields).ssid.trim();
    case "vcard": {
      const f = fields as VCardFields;
      return `${f.firstName} ${f.lastName}`.trim();
    }
    default:
      return "";
  }
}

interface QrStore {
  activeType: QrType;
  fields: QrFieldsMap;
  customization: QrCustomization;
  history: HistoryEntry[];
  _hasHydrated: boolean;

  setActiveType: (type: QrType) => void;
  updateField: (key: string, value: string) => void;
  setCustomization: (c: Partial<QrCustomization>) => void;
  restoreFromHistory: (entry: HistoryEntry) => void;
  addToHistory: (label: string) => void;
  clearHistory: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useQrStore = create<QrStore>()(
  persist(
    (set, get) => ({
      activeType: "url",
      fields: defaultFields(),
      customization: { ...DEFAULT_CUSTOMIZATION },
      history: [],
      _hasHydrated: false,

      // Switching type no longer wipes input — each type keeps its own fields.
      setActiveType: (type) => set({ activeType: type }),

      updateField: (key, value) =>
        set((state) => ({
          fields: {
            ...state.fields,
            [state.activeType]: {
              ...state.fields[state.activeType],
              [key]: value,
            },
          },
        })),

      setCustomization: (c) =>
        set((state) => ({
          customization: { ...state.customization, ...c },
        })),

      restoreFromHistory: (entry) =>
        set((state) => ({
          activeType: entry.type,
          fields: {
            ...state.fields,
            // Prefer the lossless snapshot; fall back to parsing for safety.
            [entry.type]: entry.fields ?? parsePayloadToFields(entry.type, entry.payload),
          },
          customization: { ...entry.customization },
        })),

      addToHistory: (label) => {
        const state = get();
        const type = state.activeType;
        const fieldsSnapshot = state.fields[type];
        const payload = buildPayload(type, fieldsSnapshot);
        if (!payload.value) return;
        // Never save an invalid entry (e.g. a bare "https://"), and never save
        // one the renderer would reject at the active error-correction level.
        if (
          !validatePayload(
            type,
            fieldsSnapshot,
            payload.value,
            state.customization.errorCorrectionLevel,
          ).valid
        ) {
          return;
        }

        const entryLabel =
          label || deriveLabel(type, fieldsSnapshot) || payload.value.slice(0, 40);

        const entry: HistoryEntry = {
          id: randomId(),
          type,
          label: entryLabel,
          payload: payload.value,
          fields: fieldsSnapshot,
          customization: { ...state.customization },
          timestamp: Date.now(),
        };

        // Dedupe by (type, payload) so saving the same code twice replaces it.
        const updated = [
          entry,
          ...state.history.filter((e) => !(e.type === type && e.payload === entry.payload)),
        ].slice(0, 5);
        set({ history: updated });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "qr-history",
      version: 1,
      partialize: (state) => ({
        history: state.history,
        activeType: state.activeType,
        fields: state.fields,
        customization: state.customization,
      }),
      migrate: migrateState,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// Typed hook to read a single type's fields without re-rendering on other
// types' changes. No cast needed — indexes the fields map by type.
export function useQrFields<T extends QrType>(type: T): QrFieldsMap[T] {
  return useQrStore((s) => s.fields[type]);
}

// Migrate persisted state from older store versions to the current shape.
function migrateState(persisted: unknown, version: number): unknown {
  if (!persisted || typeof persisted !== "object") {
    return {
      activeType: "url",
      fields: defaultFields(),
      customization: { ...DEFAULT_CUSTOMIZATION },
      history: [],
    };
  }
  const p = persisted as Record<string, unknown>;
  const activeType = (p.activeType as QrType) ?? "url";
  const customization = {
    ...DEFAULT_CUSTOMIZATION,
    ...(p.customization as Partial<QrCustomization> | undefined),
  };

  if (version < 1) {
    // v0: a single `fields` object (only for the active type) + fieldless
    // history entries. Rebuild the per-type map and recover entry fields.
    const fields = defaultFields();
    const oldFields = p.fields as Record<string, unknown> | undefined;
    if (oldFields && activeType in fields) {
      // Indexed write with a union key needs a widened target type.
      (fields as Record<keyof QrFieldsMap, unknown>)[activeType] = {
        ...DEFAULT_FIELDS[activeType],
        ...oldFields,
      };
    }

    const oldHistory = Array.isArray(p.history) ? (p.history as HistoryEntry[]) : [];
    const history = oldHistory.map((e) => ({
      ...e,
      fields: e.fields ?? parsePayloadToFields(e.type, e.payload),
    }));

    return { activeType, fields, customization, history };
  }

  // v1+: current shape — just backfill any missing pieces.
  return {
    activeType,
    fields: { ...defaultFields(), ...(p.fields as Partial<QrFieldsMap> | undefined) },
    customization,
    history: Array.isArray(p.history) ? (p.history as HistoryEntry[]) : [],
  };
}
