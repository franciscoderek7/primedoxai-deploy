import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrimeDox AI",
  description: "AI-assisted document drafting and case automation for Francisco Holdings Inc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
