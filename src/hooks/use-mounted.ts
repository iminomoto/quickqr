"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

// True after hydration on the client, false on the server and during the
// hydration render. Use to defer client-only (localStorage-backed) content so
// the initial client render matches the server HTML — no hydration mismatch.
// Implemented via useSyncExternalStore so React handles the flip without a
// setState-in-effect.
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
