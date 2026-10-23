import { QrCode, Palette, Download, Shield } from "lucide-react";

const steps = [
  {
    num: "1",
    title: "Choose your QR code type",
    desc: "Select from URL, text, email, phone, WiFi, or vCard — whatever you need to encode in your QR code.",
  },
  {
    num: "2",
    title: "Enter your content",
    desc: "Fill in the details to create your QR code. QuickQR validates your input in real time so you know it will scan.",
  },
  {
    num: "3",
    title: "Customize and download",
    desc: "Pick colors, dot styles, and error correction. Download your free QR code as PNG or SVG — ready for print or screen.",
  },
];

const features = [
  {
    icon: QrCode,
    title: "Six QR code types",
    desc: "Create QR codes for URLs, plain text, email addresses, phone numbers, WiFi networks, and vCard contacts — all in one free QR code generator.",
  },
  {
    icon: Palette,
    title: "Fully customizable",
    desc: "Design custom QR codes with your own colors, dot styles, and error correction levels. Make your QR code match your brand.",
  },
  {
    icon: Download,
    title: "Export your way",
    desc: "Download as high-resolution PNG (2x), scalable SVG, copy the raw payload, or share directly from your browser — all free, no sign-up required.",
  },
  {
    icon: Shield,
    title: "Private by default",
    desc: "Create QR codes online entirely in your browser. No data is ever sent to a server — your QR codes stay yours.",
  },
];

export function SeoContent() {
  return (
    <section id="seo-content" aria-label="About QuickQR" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 scroll-mt-16">
      {/* How to create */}
      <div className="mb-16">
        <h2 className="mb-2 font-tall text-2xl sm:text-3xl text-text-primary">
          How to create a QR code
        </h2>
        <p className="mb-8 max-w-2xl text-sm text-text-secondary">
          QuickQR makes it easy to generate a custom QR code in seconds. No sign-up, no watermarks, no limits.
        </p>
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-3" role="list">
          {steps.map((step) => (
            <li key={step.num} className="glass flex flex-col gap-3 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated font-mono text-xs font-bold text-text-primary">
                {step.num}
              </span>
              <h3 className="text-sm font-semibold text-text-primary">{step.title}</h3>
              <p className="text-xs leading-relaxed text-text-secondary">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="mb-2 font-tall text-2xl sm:text-3xl text-text-primary">
          Why QuickQR
        </h2>
        <p className="mb-8 max-w-2xl text-sm text-text-secondary">
          A free QR code generator built for speed, privacy, and design. Everything you need, nothing you don&apos;t.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="glass flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated">
                  <Icon size={18} className="text-text-secondary" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-text-primary">{feat.title}</h3>
                  <p className="text-xs leading-relaxed text-text-secondary">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What is a QR code — SEO paragraph */}
      <div className="glass p-6">
        <h2 className="mb-3 font-tall text-xl text-text-primary">
          What is a QR code?
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
          <p>
            A QR code (Quick Response code) is a two-dimensional barcode that stores information in a grid of black
            and white squares. Originally developed in 1994 by Denso Wave for the automotive industry, QR codes
            are now used worldwide to quickly link physical objects to digital content.
          </p>
          <p>
            You can encode URLs, contact details, WiFi credentials, plain text, and more into a QR code. When
            scanned with a smartphone camera, the encoded information is instantly available — no typing required.
            This makes QR codes perfect for sharing links, contact information, and WiFi passwords.
          </p>
          <p>
            QuickQR is a free QR code generator that creates QR codes entirely in your browser using the open QR
            code standard (ISO/IEC 18004). No data leaves your device, making it one of the most private QR code
            generators available. Create your custom QR code online in seconds — no sign-up, no watermarks, no limits.
          </p>
        </div>
      </div>
    </section>
  );
}
