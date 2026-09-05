import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blinds & Shades — Custom Window Treatments',
  description:
    'Roller shades, cellular blinds, roman shades, wood blinds, solar shades and motorized systems — precision-fitted for every window in your Northern Ontario home.',
};

const PRODUCT_TYPES = [
  {
    name: 'Roller Shades',
    desc: 'Clean, minimal, versatile. Available in light-filtering, room-darkening, and blackout fabrics. Ideal for modern interiors and cottages alike.',
    use: 'Bedrooms, living rooms, any room needing clean lines.',
  },
  {
    name: 'Cellular / Honeycomb',
    desc: 'Dual-cell honeycomb construction traps air for outstanding insulation — critical for Northern Ontario winters and cottage heating costs.',
    use: 'Energy-conscious homes, cottages, north-facing windows.',
  },
  {
    name: 'Wood & Faux Wood',
    desc: 'Classic slat blinds in real basswood or moisture-resistant faux wood. Timeless look that suits traditional and contemporary styles.',
    use: 'Living rooms, dining rooms — faux wood for high-humidity spaces.',
  },
  {
    name: 'Roman Shades',
    desc: 'Fabric shades that fold as they raise. Warmer, softer look than roller shades. Available in dozens of fabric types and patterns.',
    use: 'Formal spaces, bedrooms, windows where texture matters.',
  },
  {
    name: 'Solar Shades',
    desc: 'Block glare and UV while preserving your view. Openness factors from 1% (near-blackout) to 10% (open view with light filtering).',
    use: 'West/south-facing windows, cottage lakefront views, offices.',
  },
  {
    name: 'Vertical Blinds',
    desc: 'Individual fabric or PVC vanes on a track. Ideal for wide patio doors and large windows. Full light and privacy control.',
    use: 'Patio doors, sliding doors, wide windows.',
  },
  {
    name: 'Venetian / Mini Blinds',
    desc: 'Aluminum or wood horizontal slat blinds. Precise tilt control for light direction. Durable and easy to clean.',
    use: 'Kitchens, bathrooms, garages, commercial spaces.',
  },
  {
    name: 'Motorized Systems',
    desc: 'Any of the above, with quiet motor drives. App or voice control, scheduled automation, child-safe (no cords). Works with most smart home systems.',
    use: 'High windows, accessibility needs, smart homes.',
  },
];

export default function BlindsShdesPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-nb py-16">

        <div className="mb-4">
          <Link
            href="/products"
            className="text-sm flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: 'var(--nb-gold)', fontFamily: 'var(--font-label)' }}
          >
            ← All Products
          </Link>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="gold-line" />
            <span className="eyebrow">Window Treatments</span>
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
            Blinds & Shades
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--nb-stone)', lineHeight: '1.65' }}>
            Light. Privacy. Style. Every option below is available in custom sizes,
            measured and installed by our team. No standard sizes — everything is made for your windows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {PRODUCT_TYPES.map((p) => (
            <div
              key={p.name}
              className="card-nb p-6"
            >
              <h2
                className="font-display text-xl mb-2"
                style={{ color: 'var(--nb-night)', letterSpacing: '-0.015em' }}
              >
                {p.name}
              </h2>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--nb-stone)' }}>
                {p.desc}
              </p>
              <div
                className="text-xs font-medium"
                style={{ color: 'var(--nb-gold)', fontFamily: 'var(--font-label)' }}
              >
                Best for: {p.use}
              </div>
            </div>
          ))}
        </div>

        <div
          className="text-center p-10 rounded-2xl"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-light)' }}
        >
          <h2
            className="font-display mb-3"
            style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}
          >
            Ready to see these in your home?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--nb-stone)' }}>
            We bring samples to you. Free measurement, no obligation, expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/consultation" className="btn-primary">
              Book Free Consultation
            </Link>
            <Link href="/northern-ai" className="btn-outline-dark gap-2">
              Ask Northern AI
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
