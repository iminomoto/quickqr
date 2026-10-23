export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export type DotStyle = "square" | "rounded" | "dots";
export type EyeFrameStyle = "square" | "rounded" | "dot";
export type EyeBallStyle = "square" | "dot";

export interface UrlFields {
  url: string;
  title: string;
}

export interface TextFields {
  text: string;
}

export interface EmailFields {
  recipient: string;
  subject: string;
  body: string;
}

export interface PhoneFields {
  number: string;
}

export interface WifiFields {
  ssid: string;
  password: string;
  security: WifiSecurity;
}

export interface VCardFields {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

// Maps each QR type to its field shape. Deriving QrType from the keys keeps the
// type list and field shapes in sync, and lets us index fields by type safely.
export interface QrFieldsMap {
  url: UrlFields;
  text: TextFields;
  email: EmailFields;
  phone: PhoneFields;
  wifi: WifiFields;
  vcard: VCardFields;
}

export type QrType = keyof QrFieldsMap;

// Union of every field shape (used where the concrete type is dynamic).
export type QrFields = QrFieldsMap[QrType];

export interface QrCustomization {
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  foregroundColor: string;
  backgroundColor: string;
  dotStyle: DotStyle;
  eyeFrameStyle: EyeFrameStyle;
  eyeBallStyle: EyeBallStyle;
  quietZone: boolean;
}

export interface PayloadResult {
  value: string;
  byteLength: number;
  type: QrType;
}

export interface QrValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface HistoryEntry {
  id: string;
  type: QrType;
  label: string;
  payload: string;
  /** Lossless snapshot of the fields at save time (present on v1+ entries). */
  fields: QrFields;
  customization: QrCustomization;
  timestamp: number;
}
