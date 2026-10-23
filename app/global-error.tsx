"use client";

import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

// Last-resort boundary: renders when the root layout itself fails, so it must
// provide its own <html>/<body> and import the global styles (the layout's
// copies — including the font classes on <html> — are gone at this point).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-bg-page text-text-primary antialiased">
        <div className="noise relative flex min-h-screen items-center justify-center px-4">
          <div className="glass relative z-10 flex flex-col items-center gap-6 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated">
              <ShieldAlert size={32} className="text-text-secondary" />
            </div>
            <div className="space-y-2">
              <h2 className="font-tall text-xl font-semibold text-text-primary">
                Something went wrong
              </h2>
              <p className="text-sm text-text-secondary">
                An unexpected error occurred. Please try again.
              </p>
            </div>
            <button onClick={reset} className="btn-primary">
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
