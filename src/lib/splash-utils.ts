let subscribers: (() => void)[] = [];

export function subscribeSplashChanges(callback: () => void): () => void {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter((s) => s !== callback);
  };
}

export function hasSplashBeenSeen(): boolean {
  try {
    return localStorage.getItem("quickqr-splash-seen") === "true";
  } catch {
    return false;
  }
}

export function markSplashSeen(): void {
  try {
    localStorage.setItem("quickqr-splash-seen", "true");
    subscribers.forEach((s) => s());
  } catch {
    /* noop */
  }
}
