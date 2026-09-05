import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Products — Blinds, Shades, Windows & Doors',
  description:
    'Browse our full range of custom blinds, shades, windows, and doors for Northern Ontario homes, cottages, and businesses.',
};

const CATEGORIES = [
  {
    title: 'Blinds & Shades',
    href: '/products/blinds-shades',
    description:
      'Roller shades, cellular/honeycomb, wood blinds, roman shades, solar shades, and motorized systems — precision-fitted to every window.',
    types: ['Roller Shades', 'Cellular / Honeycomb', 'Wood & Faux Wood', 'Roman Shades', 'Solar Shades', 'Vertical Blinds', 'Venetian / Mini Blinds', 'Sheer & Layered'],
    accent: 'var(--nb-gold)',
  },
  {
    title: 'Windows',
    href: '/products/windows',
    description:
      'Energy-efficient casement, double-hung, awning, and picture windows. Built for Northern Ontario winters.',
    types: ['Casement', 'Double-Hung', 'Awning', 'Picture / Fixed', 'Bay & Bow', 'Slider', 'Egress'],
    accent: 'var(--nb-sage)',
  },
  {
    title: 'Doors',
    href: '/products/doors',
    description:
      'Steel, fibreglass, and patio doors. Front entries that make a statement, patio doors that open your home to the lake.',
    types: ['Entry Doors', 'Patio / Sliding Doors', 'French Doors', 'Storm Doors'],
    accent: 'var(--nb-driftwood)',
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-nb py-16">

        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="gold-line" />
            <span className="eyebrow">What We Offer</span>
            <span className="gold-line" />
          </div>
          <h1
            className="font-display mb-4"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              letterSpacing: '-0.025em',
              lineHeight: '1.1',
              color: 'var(--nb-night)',
            }}
          >
            Our Products
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--nb-stone)', lineHeight: '1.65' }}>
            Everything your home, cottage, or business needs — measured and installed by our team.
          </p>
        </div>

        <div className="space-y-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.href}
              className="card-nb p-8 md:p-10"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <h2
                    className="font-display mb-2"
                    style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}
                  >
                    {cat.title}
                  </h2>
                  <p className="text-base mb-6" style={{ color: 'var(--nb-stone)' }}>
                    {cat.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.types.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(74,69,64,0.06)',
                          color: 'var(--nb-stone)',
                          fontFamily: 'var(--font-label)',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={cat.href}
                  className="flex items-center gap-2 text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-70"
                  style={{ color: cat.accent, fontFamily: 'var(--font-label)' }}
                >
                  View details
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm mb-6" style={{ color: 'var(--nb-stone)' }}>
            Not sure what you need? Our free in-home consultation covers everything.
          </p>
          <Link href="/consultation" className="btn-primary">
            Book Free Consultation
          </Link>
        </div>

      </div>
    </div>
  );
}
