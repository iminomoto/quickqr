import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

const bebasNeue = localFont({
  src: "../src/fonts/BebasNeue-Regular.woff2",
  variable: "--font-bebas",
  display: "swap",
});

const stretchPro = localFont({
  src: "../src/fonts/StretchPro-Regular.woff2",
  variable: "--font-stretch",
  display: "swap",
});

const roTheFight = localFont({
  src: "../src/fonts/RoTheFight-Regular.woff2",
  variable: "--font-rothefight",
  display: "swap",
});

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: {
    default: "QuickQR — Free QR Code Generator Online",
    template: "%s | QuickQR",
  },
  description:
    "Generate custom QR codes instantly. Create QR codes for URLs, text, email, phone, WiFi, and vCard with custom colors, styles, and sizes. Free, fast, and client-side.",
  keywords: [
    "QR code generator",
    "free QR code",
    "QR code maker",
    "create QR code",
    "custom QR code",
    "QR code online",
    "WiFi QR code",
    "vCard QR code",
    "URL QR code",
    "download QR code",
  ],
  authors: [{ name: "QuickQR" }],
  creator: "QuickQR",
  publisher: "QuickQR",
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#0a0a0a",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "QuickQR",
    title: "QuickQR — Free QR Code Generator Online",
    description:
      "Generate custom QR codes instantly. Create QR codes for URLs, text, email, phone, WiFi, and vCard with custom colors, styles, and sizes.",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "QuickQR — Free QR Code Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickQR — Free QR Code Generator Online",
    description:
      "Generate custom QR codes instantly. Create QR codes for URLs, text, email, phone, WiFi, and vCard with custom colors, styles, and sizes.",
    images: ["/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "QuickQR",
      url: SITE_URL,
      description:
        "Free online QR code generator. Create custom QR codes for URLs, text, email, phone, WiFi, and vCard with customizable colors, styles, and sizes.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Generate QR codes for URLs",
        "Generate QR codes for plain text",
        "Generate QR codes for email addresses",
        "Generate QR codes for phone numbers",
        "Generate QR codes for WiFi credentials",
        "Generate QR codes for vCard contacts",
        "Custom QR code colors and styles",
        "Download QR codes as PNG or SVG",
        "Client-side generation — no data sent to server",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a QR code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A QR code (Quick Response code) is a two-dimensional barcode that stores information in a grid of black and white squares. It can encode URLs, text, contact details, WiFi credentials, and more. When scanned with a smartphone camera, the encoded information is instantly available.",
          },
        },
        {
          "@type": "Question",
          name: "How do I create a QR code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Creating a QR code with QuickQR is simple: (1) Choose your QR code type (URL, text, email, phone, WiFi, or vCard), (2) Enter your content in the form, (3) Customize colors and styles if desired, then (4) Download your QR code as PNG or SVG. The entire process takes seconds.",
          },
        },
        {
          "@type": "Question",
          name: "Are QR codes free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, QuickQR is completely free to use. There are no sign-up requirements, no watermarks on your QR codes, and no limits on how many you can create. Everything runs in your browser, so there are no server costs passed on to you.",
          },
        },
        {
          "@type": "Question",
          name: "Do QR codes expire?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Static QR codes (like those generated by QuickQR) never expire. Once created, the encoded information remains permanently embedded in the QR code pattern. However, if your QR code links to a URL, that URL could become unavailable over time.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between a static and dynamic QR code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A static QR code has the data directly encoded in its pattern — once created, it cannot be changed. A dynamic QR code stores a short URL that redirects to the actual content, allowing you to update the destination later. QuickQR generates static QR codes for maximum privacy and permanence.",
          },
        },
        {
          "@type": "Question",
          name: "Can I customize the colors of my QR code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! QuickQR lets you customize the foreground and background colors of your QR code. You can also choose between different dot styles (square, rounded, or dots) and eye styles. Just make sure there's enough contrast between foreground and background for reliable scanning.",
          },
        },
        {
          "@type": "Question",
          name: "What file formats can I download?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "QuickQR supports two download formats: PNG (high-resolution 2x) for raster graphics, and SVG for scalable vector graphics that can be resized without losing quality. PNG is ideal for web use and social media, while SVG is perfect for print materials.",
          },
        },
        {
          "@type": "Question",
          name: "How do I scan a QR code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most modern smartphones can scan QR codes directly through the camera app. Simply open your camera, point it at the QR code, and tap the notification that appears. On iPhone, you can also use the Code Scanner in Control Center. Android phones may have a built-in QR scanner or you can use Google Lens.",
          },
        },
        {
          "@type": "Question",
          name: "What size should a QR code be for printing?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For print materials, a QR code should be at least 2cm x 2cm (0.8 x 0.8 inches) for reliable scanning. Larger sizes scan more easily. QuickQR exports high-resolution PNGs (up to 640x640 pixels at 2x) plus scalable SVG that stays crisp at any size — from business cards to posters.",
          },
        },
        {
          "@type": "Question",
          name: "Is it safe to scan QR codes?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "QR codes themselves are just data — they cannot contain malware. However, always be cautious about scanning QR codes from untrusted sources, as they could link to malicious websites. QuickQR generates QR codes locally in your browser, so you know exactly what data is encoded.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      name: "How to create a QR code with QuickQR",
      description: "Generate a custom QR code in three simple steps using QuickQR's free online QR code generator.",
      step: [
        {
          "@type": "HowToStep",
          name: "Choose your QR code type",
          text: "Select from URL, text, email, phone, WiFi, or vCard — whatever you need to encode in your QR code.",
        },
        {
          "@type": "HowToStep",
          name: "Enter your content",
          text: "Fill in the details to create your QR code. QuickQR validates your input in real time so you know it will scan.",
        },
        {
          "@type": "HowToStep",
          name: "Customize and download",
          text: "Pick colors, dot styles, and error correction. Download your free QR code as PNG or SVG — ready for print or screen.",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geist.variable} ${jetbrains.variable} ${bebasNeue.variable} ${stretchPro.variable} ${roTheFight.variable}`}
    >
      <body>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
