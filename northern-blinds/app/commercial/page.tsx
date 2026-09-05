import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Commercial — Window Treatments for Business',
  description:
    'Custom blinds, solar shades, and window coverings for offices, retail, healthcare, and commercial spaces in Northern Ontario.',
};

const SPACES = [
  { name: 'Offices', desc: 'Screen glare control is critical for productivity. Solar shades in 3–5% openness balance light and view without washing out monitors.' },
  { name: 'Retail Spaces', desc: 'Create the right atmosphere, manage heat gain from storefront glass, protect merchandise from UV fading.' },
  { name: 'Healthcare & Clinics', desc: 'Privacy-first window treatments with easy-clean surfaces. Motorized options for hands-free operation.' },
  { name: 'Hospitality', desc: 'Guest-room blackout systems, lobby solar shades, and durable commercial-grade products built for high turnover.' },
  { name: 'Multi-Unit Residential', desc: 'Standardized installations across units for consistency, durability, and property value.' },
  { name: 'Institutional', desc: 'Schools, community centres, and government facilities. Volume pricing available on request.' },
];

export default function CommercialPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-nb py-16">

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="gold-line" />
            <span className="eyebrow">For Businesses</span>
          </div>
          <h1
            className="font-display mb-4"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--nb-night)' }}
          >
            Commercial
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--nb-stone)', lineHeight: '1.65' }}>
            Commercial window treatment projects are our specialty — from single-office installs
            to multi-space buildouts. We work around your schedule and deliver the same precision
            measurement and installation we bring to every residential job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {SPACES.map((s) => (
            <div key={s.name} className="card-nb p-6">
              <h2 className="font-display text-xl mb-2" style={{ color: 'var(--nb-night)', letterSpacing: '-0.015em' }}>
                {s.name}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nb-stone)' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center p-10 rounded-2xl" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-light)' }}>
          <h2 className="font-display mb-3" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}>
            Get a commercial quote
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--nb-stone)' }}>
            Tell us about your space and we&apos;ll arrange a site visit and tailored quote.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/consultation" className="btn-primary">Request a Quote</Link>
            <Link href="/northern-ai" className="btn-outline-dark gap-2">Ask Northern AI <ArrowRight size={15} /></Link>
          </div>
        </div>

      </div>
    </div>
  );
}
