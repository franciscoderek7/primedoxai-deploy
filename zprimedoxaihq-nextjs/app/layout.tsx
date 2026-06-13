import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "zPrimeDox AI HQ — The World's First Cannabis Constitutional Intelligence Engine",
  description: "One brain. Five powers. Infinite empire. Built by Doc Weedlaw.",
  manifest: "/manifest.json",
  themeColor: "#2E7D32",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js'); }); }`
        }} />
      </body>
    </html>
  );
}
