import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Windows — Energy-Efficient Custom Windows',
  description:
    'Casement, double-hung, awning, picture, and bay windows built for Northern Ontario winters. Professional supply and installation.',
};

const WINDOW_TYPES = [
  {
    name: 'Casement',
    desc: 'Side-hinged sash that swings outward. Excellent seal when closed — ideal for energy efficiency and catching cross-breezes.',
  },
  {
    name: 'Double-Hung',
    desc: 'Both sashes move up and down. Classic look, easy to clean from inside — the most common window type in Canadian homes.',
  },
  {
    name: 'Awning',
    desc: 'Top-hinged, opens outward at the bottom. Allows ventilation even during light rain. Often installed above other window types.',
  },
  {
    name: 'Picture / Fixed',
    desc: 'Non-operable windows that maximize light and unobstructed views. Perfect for lake-facing walls or architectural focal points.',
  },
  {
    name: 'Bay & Bow',
    desc: 'Projecting window configurations that add depth, seating, and light. Common in dining rooms and living rooms.',
  },
  {
    name: 'Slider',
    desc: 'Horizontal sliding sashes. Good for wide openings and spaces where swing clearance is limited.',
  },
  {
    name: 'Egress',
    desc: 'Building-code-compliant windows sized for emergency exit. Required in bedrooms below grade and basement conversions.',
  },
];

export default function WindowsPage() {
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
            <span className="gold-line" style={{ background: 'var(--nb-sage)' }} />
            <span className="eyebrow" style={{ color: 'var(--nb-sage)' }}>Energy · Clarity · Craft</span>
          </div>
          <h1
            className="font-display mb-4"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--nb-night)' }}
          >
            Windows
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--nb-stone)', lineHeight: '1.65' }}>
            Built for Northern Ontario winters — sealed tight, energy-efficient, and designed
            to frame your best view. Supplied and installed by our team.
          </p>
        </div>

        <div
          className="p-5 rounded-xl border mb-10"
          style={{ background: 'rgba(77,124,94,0.06)', borderColor: 'rgba(77,124,94,0.2)' }}
        >
          <p className="text-sm" style={{ color: 'var(--nb-stone)' }}>
            <strong style={{ color: 'var(--nb-sage)' }}>Northern Ontario note:</strong>{' '}
            All windows we carry meet or exceed Canadian energy standards for our climate zone. We discuss U-values, Low-E glass options, and gas fills at the consultation — in plain language, not jargon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {WINDOW_TYPES.map((w) => (
            <div key={w.name} className="card-nb p-6">
              <h2 className="font-display text-xl mb-2" style={{ color: 'var(--nb-night)', letterSpacing: '-0.015em' }}>
                {w.name}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nb-stone)' }}>
                {w.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center p-10 rounded-2xl" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-light)' }}>
          <h2 className="font-display mb-3" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}>
            Get an in-home quote
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--nb-stone)' }}>
            Window projects vary widely. The fastest path to an accurate quote is a free site visit.
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
