"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { QrTypeTabs } from "@/components/qr-type-tabs";
import { CustomizationPanel } from "@/components/customization-panel";
import { PreviewPanel } from "@/components/preview-panel";
import { ExportControls } from "@/components/export-controls";
import { PayloadPreview } from "@/components/payload-preview";
import { SeoContent } from "@/components/seo-content";
import { FaqSection } from "@/components/faq-section";
import { ScrollIndicator } from "@/components/scroll-indicator";
import { hasSplashBeenSeen, markSplashSeen, subscribeSplashChanges } from "@/lib/splash-utils";
import { validatePayload } from "@/lib/payload-builders";
import { useQrStore } from "@/hooks/use-qr-store";
import { useMounted } from "@/hooks/use-mounted";
import type { QrType } from "@/types";

import { UrlForm } from "@/components/input-forms/url-form";
import { TextForm } from "@/components/input-forms/text-form";
import { EmailForm } from "@/components/input-forms/email-form";
import { PhoneForm } from "@/components/input-forms/phone-form";
import { WifiForm } from "@/components/input-forms/wifi-form";
import { VCardForm } from "@/components/input-forms/vcard-form";

const Particles = dynamic(() => import("@/components/particles").then((m) => m.Particles), { ssr: false });
const SplashScreen = dynamic(() => import("@/components/splash-screen").then((m) => m.SplashScreen), { ssr: false });
const HistoryStrip = dynamic(() => import("@/components/history-strip").then((m) => m.HistoryStrip), { ssr: false });

const FORMS: Record<QrType, React.FC> = {
  url: UrlForm,
  text: TextForm,
  email: EmailForm,
  phone: PhoneForm,
  wifi: WifiForm,
  vcard: VCardForm,
};

const panelVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      delay: i * 0.07,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export function QrApp() {
  const mounted = useMounted();
  const activeType = useQrStore((s) => s.activeType);
  const activeFields = useQrStore((s) => s.fields[s.activeType]);
  const ecLevel = useQrStore((s) => s.customization.errorCorrectionLevel);
  const addToHistory = useQrStore((s) => s.addToHistory);
  const _hasHydrated = useQrStore((s) => s._hasHydrated);
  const showSplash = useSyncExternalStore(
    subscribeSplashChanges,
    () => !hasSplashBeenSeen(),
    () => true,
  );

  const contentVisible = !showSplash;

  const ActiveForm = FORMS[activeType];

  // Gate "Save to history" on the current input being a valid, saveable code
  // at the active ECC level (addToHistory also re-validates, so nothing
  // invalid or over-capacity can slip through).
  const canSave = useMemo(
    () => validatePayload(activeType, activeFields, undefined, ecLevel).valid,
    [activeType, activeFields, ecLevel],
  );

  const handleSave = useCallback(() => {
    if (canSave) {
      addToHistory("");
    }
  }, [canSave, addToHistory]);

  const handleSplashComplete = useCallback(() => {
    markSplashSeen();
  }, []);

  // Wait for client mount (avoids hydration mismatch) and store rehydration
  // before rendering the persisted-state-driven UI.
  if (!mounted || !_hasHydrated) {
    return <div className="relative min-h-screen bg-bg-page" />;
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onComplete={handleSplashComplete}
          />
        )}
      </AnimatePresence>

      <div className={`noise relative min-h-screen transition-opacity duration-300 ${contentVisible ? "opacity-100" : "opacity-0"}`}>
        <div className="bg-lightburst" />
        <Particles />

      <div className={`relative z-10 flex min-h-screen flex-col ${showSplash ? "pointer-events-none" : ""}`}>
        <Header />

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.div custom={0} variants={panelVariants}>
              <QrTypeTabs />
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr]">
              {/* Left column — Input + Payload Preview */}
              <motion.div
                custom={1}
                variants={panelVariants}
                className="aurora-container glass-strong flex flex-col gap-5 p-6"
              >
                {/* Stable tabpanel wrapper: keeps the tab's aria-controls id
                    valid at all times (the exiting form must not duplicate it). */}
                <div id={`panel-${activeType}`} role="tabpanel">
                  {/* popLayout lets the incoming form lay out immediately while
                      the outgoing one pops out of flow and fades. Height animates
                      to "auto" so switching between forms of very different
                      heights (vCard is the tallest) grows/shrinks the panel
                      smoothly instead of jumping in a single frame. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={activeType}
                      initial={{ opacity: 0, y: 6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{
                        height: {
                          type: "tween",
                          duration: 0.4,
                          ease: "easeInOut",
                        },
                        opacity: { duration: 0.18 },
                        y: { type: "spring", stiffness: 200, damping: 24 },
                      }}
                      className="overflow-hidden"
                    >
                      <ActiveForm />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div>
                  <motion.button
                    onClick={handleSave}
                    disabled={!canSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary"
                  >
                    <Plus size={14} />
                    Save to history
                  </motion.button>
                </div>
                <PayloadPreview />
              </motion.div>

              {/* Center column — QR Preview */}
              <div className="flex flex-col items-center gap-4 self-start">
                <motion.div
                  custom={2}
                  variants={panelVariants}
                  className="aurora-container glass-strong relative z-10 p-6"
                >
                  <PreviewPanel />
                </motion.div>

                <motion.div
                  custom={3}
                  variants={panelVariants}
                  className="aurora-container glass relative z-10 p-4 w-full"
                >
                  <ExportControls />
                </motion.div>
              </div>

              {/* Right column — Customization */}
              <motion.div
                custom={4}
                variants={panelVariants}
                className="aurora-container glass-strong p-6"
              >
                <CustomizationPanel />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            custom={5}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
          >
            <HistoryStrip />
          </motion.div>

          <motion.div
            custom={6}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
          >
            <ScrollIndicator />
          </motion.div>

          <motion.div
            custom={7}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="pt-4">
              <SeoContent />
            </div>
          </motion.div>

          <motion.div
            custom={8}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
          >
            <FaqSection />
          </motion.div>
        </div>

        <footer className="relative z-10 rounded-lg border border-border-subtle bg-bg-surface px-4 py-4 text-center text-xs text-text-muted backdrop-blur-sm">
          <nav className="mb-2 flex justify-center gap-6" aria-label="Footer">
            <a href="#seo-content" className="transition-colors hover:text-text-primary">About</a>
            <a href="#faq" className="transition-colors hover:text-text-primary">FAQ</a>
            <a href="https://github.com/iminomoto" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-text-primary">GitHub</a>
          </nav>
          <p>&copy; 2026 QuickQR &mdash; Free QR code generator. Create custom QR codes online.</p>
        </footer>
      </div>
      </div>
    </>
  );
}
