"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { markSplashSeen } from "@/lib/splash-utils";

const ROWS = [
  { text: "generate", animation: "slide-up" as const },
  { text: "QRR", animation: "hero" as const, isHero: true },
  { text: "codes", animation: "clip-reveal" as const },
  { text: "instantly", animation: "fade-scale" as const },
] as const;

const ROW_REVEAL_DURATION = 200;
const HOLD_DURATION = 1000;
const EXIT_DURATION = 350;

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const heroVariants = {
  hidden: { opacity: 0, scale: 0.85, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 200, damping: 20, duration: 0.5 },
  },
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const clipRevealVariants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const fadeScaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  // Single completion path (timed or skipped) — idempotent so a skip racing
  // the timer can't double-fire the completion side effects.
  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markSplashSeen();
    onCompleteRef.current();
  }, []);

  // The intro must never trap people: Escape (or a click anywhere) skips it.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        complete();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [complete]);

  useEffect(() => {
    if (reducedMotion) {
      const t = setTimeout(complete, 600);
      return () => clearTimeout(t);
    }

    let mounted = true;

    const run = async () => {
      setShow(true);

      for (let i = 1; i <= ROWS.length; i++) {
        if (!mounted) return;
        await new Promise((r) => setTimeout(r, ROW_REVEAL_DURATION));
      }

      if (!mounted) return;
      await new Promise((r) => setTimeout(r, HOLD_DURATION));

      if (!mounted) return;
      complete();
    };

    const timeout = setTimeout(run, 100);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [reducedMotion, complete]);

  const getRowClassName = (animation: string, isHero?: boolean) => {
    const base = "splash-row-text";
    const animationClass = `splash-row-text--${animation}`;
    const heroClass = isHero ? "is-hero" : "";
    return `${base} ${animationClass} ${heroClass}`.trim();
  };

  return (
    <motion.div
      className="splash-screen"
      onClick={complete}
      exit={{ y: "-100%", transition: { duration: EXIT_DURATION / 1000, ease: [0.16, 1, 0.3, 1] } }}
    >
      <div className="splash-bg" />

      <button
        type="button"
        onClick={complete}
        className="absolute bottom-6 right-6 z-10 rounded-md border border-border-subtle bg-bg-surface/60 px-3 py-1.5 text-xs text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary"
      >
        Skip
      </button>

      <motion.div
        className="splash-content"
        variants={containerVariants}
        initial="hidden"
        animate={show ? "visible" : "hidden"}
      >
        {ROWS.map((row) => (
          <div key={row.text} className="splash-row">
            <motion.div
              className={getRowClassName(row.animation, "isHero" in row && row.isHero)}
              variants={
                row.animation === "hero"
                  ? heroVariants
                  : row.animation === "slide-up"
                    ? slideUpVariants
                    : row.animation === "clip-reveal"
                      ? clipRevealVariants
                      : fadeScaleVariants
              }
              {...(row.animation === "hero"
                ? {
                    animate: show
                      ? {
                          opacity: 1,
                          scale: 1,
                          filter: "blur(0px)",
                          textShadow: [
                            "0 0 20px rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.1)",
                            "0 0 30px rgba(255,255,255,0.35), 0 0 60px rgba(255,255,255,0.15)",
                          ],
                        }
                      : { opacity: 0, scale: 0.85, filter: "blur(12px)" },
                    transition: {
                      opacity: { type: "spring" as const, stiffness: 200, damping: 20 },
                      scale: { type: "spring" as const, stiffness: 200, damping: 20 },
                      filter: { type: "spring" as const, stiffness: 200, damping: 20 },
                      textShadow: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse" as const,
                        ease: "easeInOut",
                      },
                    },
                  }
                : {})}
            >
              {row.text}
            </motion.div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
