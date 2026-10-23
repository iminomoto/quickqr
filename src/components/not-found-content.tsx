"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Header } from "@/components/header";
import dynamic from "next/dynamic";
import { generateMatrix, renderQrSvg } from "@/lib/qr-renderer";

const Particles = dynamic(() => import("@/components/particles").then((m) => m.Particles), { ssr: false });

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const qrVariants = {
  hidden: { opacity: 0, scale: 0.85, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
};

export function NotFoundContent() {
  const svgString = useMemo(() => {
    const matrix = generateMatrix("404", "M");
    if (!matrix) return null;
    return renderQrSvg(matrix, {
      size: 220,
      fg: "#ededed",
      bg: "#0a0a0a",
      dotStyle: "square",
      eyeFrameStyle: "rounded",
      eyeBallStyle: "dot",
      quietZone: false,
      showBackground: false,
    });
  }, []);

  return (
    <div className="noise relative min-h-screen">
      <div className="bg-lightburst" />
      <Particles />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="flex flex-1 items-center justify-center px-4 py-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-6 text-center"
          >
            {svgString && (
              <motion.div variants={qrVariants} className="glitch-qr">
                {/* Base QR */}
                <div
                  className="glitch-qr-base"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
                {/* RGB ghost layers */}
                <div
                  className="glitch-qr-ghost glitch-qr-ghost--r"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
                <div
                  className="glitch-qr-ghost glitch-qr-ghost--g"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
                <div
                  className="glitch-qr-ghost glitch-qr-ghost--b"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
                {/* Scanlines */}
                <div className="glitch-scanlines" />
                {/* Horizontal displacement bands */}
                <div className="glitch-bands">
                  <div className="glitch-band glitch-band--1" />
                  <div className="glitch-band glitch-band--2" />
                  <div className="glitch-band glitch-band--3" />
                  <div className="glitch-band glitch-band--4" />
                </div>
                {/* Noise flicker */}
                <div className="glitch-noise" />
              </motion.div>
            )}

            <motion.h1
              variants={itemVariants}
              className="font-ro text-xl tracking-widest text-text-primary uppercase"
            >
              page not found
            </motion.h1>

            <motion.div variants={itemVariants}>
              <Link
                href="/"
                className="btn-primary justify-center px-6 py-3 text-sm"
              >
                Go back home
              </Link>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
