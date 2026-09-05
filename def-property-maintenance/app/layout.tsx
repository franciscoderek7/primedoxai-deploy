import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-label',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DEF Property Maintenance — Cottage Country Property & Security Specialists | Kawarthas & Muskoka',
    template: '%s | DEF Property Maintenance',
  },
  description:
    'DEF Property Maintenance — Cottage country property care, maintenance, and security-focused services. Serving Kawarthas, Muskoka, and surrounding areas. Powered by AI Property 360™.',
  keywords: [
    'property maintenance',
    'cottage care',
    'Kawarthas property maintenance',
    'Muskoka property maintenance',
    'cottage security',
    'property inspection',
    'AI Property 360',
    'locksmith services',
    'seasonal property',
    'vacant property monitoring',
    'Peterborough property maintenance',
  ],
  authors: [{ name: 'DEF Property Maintenance' }],
  creator: 'DEF Property Maintenance',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'DEF Property Maintenance',
    title: 'DEF Property Maintenance — Cottage Country Property & Security Specialists',
    description:
      'Property maintenance, cottage care, and security-focused services for Kawarthas & Muskoka.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEF Property Maintenance',
    description: 'Cottage Country Property Maintenance & Security-Focused Specialists.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D1421',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
