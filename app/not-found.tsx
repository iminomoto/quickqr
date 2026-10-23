import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found-content";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Go back to QuickQR to generate custom QR codes.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundContent />;
}
