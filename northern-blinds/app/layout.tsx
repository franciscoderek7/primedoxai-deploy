import type { Metadata, Viewport } from 'next';
import { Cormorant_Garant, Inter, DM_Sans } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

const cormorantGarant = Cormorant_Garant({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-label',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Northern Blinds — Custom Blinds, Windows & Doors | Kawarthas & Muskoka',
    template: '%s | Northern Blinds',
  },
  description:
    'Custom blinds, shades, windows, and doors designed for Northern Ontario living. Expert measurement, installation, and AI-powered consultation for Kawarthas, Muskoka, and Peterborough.',
  keywords: [
    'custom blinds',
    'window treatments',
    'blinds Kawarthas',
    'blinds Muskoka',
    'blinds Peterborough',
    'custom windows',
    'doors installation',
    'Northern Ontario',
    'cottage blinds',
    'motorized blinds',
  ],
  authors: [{ name: 'Northern Blinds' }],
  creator: 'Northern Blinds',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'Northern Blinds',
    title: 'Northern Blinds — Custom Blinds, Windows & Doors',
    description:
      'Expert custom window treatments and installations for Kawarthas, Muskoka & Peterborough.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Northern Blinds — Custom Blinds, Windows & Doors',
    description:
      'Expert custom window treatments and installations for Kawarthas, Muskoka & Peterborough.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D1117',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorantGarant.variable} ${inter.variable} ${dmSans.variable}`}
    >
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
