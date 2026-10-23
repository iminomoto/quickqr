"use client";

import { motion } from "motion/react";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border-subtle bg-bg-page/80 backdrop-blur-xl"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-bg-elevated focus:px-4 focus:py-2 focus:text-xs focus:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            className="h-8 w-8"
            role="img"
            aria-label="QuickQR logo"
          >
            <title>QuickQR</title>
            <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
            <rect x="4" y="4" width="10" height="10" rx="1.5" fill="white"/>
            <rect x="6" y="6" width="6" height="6" rx="1" fill="#0a0a0a"/>
            <rect x="7.5" y="7.5" width="3" height="3" rx="0.5" fill="white"/>
            <rect x="18" y="4" width="10" height="10" rx="1.5" fill="white"/>
            <rect x="20" y="6" width="6" height="6" rx="1" fill="#0a0a0a"/>
            <rect x="21.5" y="7.5" width="3" height="3" rx="0.5" fill="white"/>
            <rect x="4" y="18" width="10" height="10" rx="1.5" fill="white"/>
            <rect x="6" y="20" width="6" height="6" rx="1" fill="#0a0a0a"/>
            <rect x="7.5" y="21.5" width="3" height="3" rx="0.5" fill="white"/>
            <rect x="16" y="16" width="4" height="4" rx="0.5" fill="white"/>
            <rect x="22" y="18" width="4" height="4" rx="0.5" fill="white"/>
            <rect x="24" y="22" width="2" height="2" rx="0.3" fill="white"/>
            <rect x="18" y="24" width="4" height="4" rx="0.5" fill="white"/>
            <rect x="26" y="16" width="2" height="4" rx="0.3" fill="white"/>
          </svg>
          <h1 className="text-sm font-semibold tracking-tight text-text-primary">
            QuickQR
          </h1>
        </div>
        <a
          href="https://github.com/iminomoto"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="flex h-8 items-center justify-center rounded-md px-2.5 text-text-muted transition-colors hover:text-text-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="GitHub"><title>GitHub</title><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
      </div>
    </motion.header>
  );
}
