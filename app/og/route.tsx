import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* QR Logo */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 32 32"
          style={{ marginBottom: "24px" }}
        >
          <rect width="32" height="32" rx="6" fill="#0a0a0a" />
          <rect x="4" y="4" width="10" height="10" rx="1.5" fill="white" />
          <rect x="6" y="6" width="6" height="6" rx="1" fill="#0a0a0a" />
          <rect x="7.5" y="7.5" width="3" height="3" rx="0.5" fill="white" />
          <rect x="18" y="4" width="10" height="10" rx="1.5" fill="white" />
          <rect x="20" y="6" width="6" height="6" rx="1" fill="#0a0a0a" />
          <rect x="21.5" y="7.5" width="3" height="3" rx="0.5" fill="white" />
          <rect x="4" y="18" width="10" height="10" rx="1.5" fill="white" />
          <rect x="6" y="20" width="6" height="6" rx="1" fill="#0a0a0a" />
          <rect x="7.5" y="21.5" width="3" height="3" rx="0.5" fill="white" />
          <rect x="16" y="16" width="4" height="4" rx="0.5" fill="white" />
          <rect x="22" y="18" width="4" height="4" rx="0.5" fill="white" />
          <rect x="24" y="22" width="2" height="2" rx="0.3" fill="white" />
          <rect x="18" y="24" width="4" height="4" rx="0.5" fill="white" />
          <rect x="26" y="16" width="2" height="4" rx="0.3" fill="white" />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#f0f0f0",
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          QuickQR
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: 400,
            color: "#a0a0a0",
            letterSpacing: "0.02em",
          }}
        >
          Free QR Code Generator Online
        </div>

        {/* Feature tags */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "32px",
          }}
        >
          {["URL", "Text", "Email", "Phone", "WiFi", "vCard"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "rgba(255,255,255,0.04)",
                fontSize: "14px",
                color: "#a0a0a0",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
