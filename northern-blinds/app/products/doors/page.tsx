import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Doors — Entry, Patio & Custom Doors',
  description:
    'Steel, fibreglass, and patio doors for Northern Ontario homes and cottages. Professional supply and installation.',
};

const DOOR_TYPES = [
  {
    name: 'Entry Doors',
    desc: 'Fibreglass and steel entry doors that withstand Northern Ontario winters. Fibreglass offers the warmth of wood without warping; steel provides maximum security.',
  },
  {
    name: 'Patio / Sliding Doors',
    desc: 'Wide-view sliding glass doors perfect for deck and lake access. Double or triple pane, thermal break frames, optional built-in blinds.',
  },
  {
    name: 'French Doors',
    desc: 'Double-door style with full-height glass panels. Elegant indoor-outdoor connection for patios, sunrooms, and walkout basements.',
  },
  {
    name: 'Storm Doors',
    desc: 'Add an extra layer of insulation and protection to any existing exterior door. Full-glass or half-glass options.',
  },
];

export default function DoorsPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-nb py-16">

        <div className="mb-4">
          <Link href="/products" className="text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--nb-gold)', fontFamily: 'var(--font-label)' }}>
            ← All Products
          </Link>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="gold-line" style={{ background: 'var(--nb-driftwood)' }} />
            <span className="eyebrow" style={{ color: 'var(--nb-driftwood)' }}>Entry · Patio · Security</span>
          </div>
          <h1
            className="font-display mb-4"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--nb-night)' }}
          >
            Doors
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--nb-stone)', lineHeight: '1.65' }}>
            From the front entry that makes a first impression to the patio door that opens your home to the lake —
            we supply and install doors built for Northern Ontario living.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {DOOR_TYPES.map((d) => (
            <div key={d.name} className="card-nb p-6">
              <h2 className="font-display text-xl mb-2" style={{ color: 'var(--nb-night)', letterSpacing: '-0.015em' }}>
                {d.name}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nb-stone)' }}>
                {d.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center p-10 rounded-2xl" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-light)' }}>
          <h2 className="font-display mb-3" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}>
            See options in person
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--nb-stone)' }}>
            Door sizing and installation is location-specific. Book a free visit and we&apos;ll walk you through your options on-site.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/consultation" className="btn-primary">Book Free Consultation</Link>
            <Link href="/northern-ai" className="btn-outline-dark gap-2">Ask Northern AI <ArrowRight size={15} /></Link>
          </div>
        </div>

      </div>
    </div>
  );
}
