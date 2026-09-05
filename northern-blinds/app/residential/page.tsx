import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Residential — Custom Window Treatments for Your Home',
  description:
    'Bedroom blackout shades, kitchen blinds, living room window treatments — custom-fitted for every room in your Northern Ontario home.',
};

const ROOMS = [
  { name: 'Living Rooms', desc: 'Light control without losing your view. Roman shades, solar shades, and wood blinds for a polished, layered look.' },
  { name: 'Bedrooms', desc: 'True blackout for better sleep. Cellular and roller blackout shades with inside-mount precision fit.' },
  { name: 'Kitchens', desc: 'Moisture-resistant faux wood and aluminum blinds that handle steam and splashes without warping.' },
  { name: 'Bathrooms', desc: 'Privacy without sacrificing natural light. Day/night rollers, frosted options, and moisture-rated products.' },
  { name: 'Home Offices', desc: 'Reduce glare on screens while keeping the room bright. Solar shades in 3–5% openness factor are ideal.' },
  { name: 'Dining Rooms', desc: 'Elegant roman shades or wood blinds that complement your furniture and set the right mood.' },
];

export default function ResidentialPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-nb py-16">

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="gold-line" />
            <span className="eyebrow">For Homeowners</span>
          </div>
          <h1
            className="font-display mb-4"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--nb-night)' }}
          >
            Residential
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--nb-stone)', lineHeight: '1.65' }}>
            Every room has different needs. We measure and install custom window treatments
            for every space in your home — from the bedroom that needs total darkness
            to the kitchen that needs easy-wipe durability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {ROOMS.map((r) => (
            <div key={r.name} className="card-nb p-6">
              <h2 className="font-display text-xl mb-2" style={{ color: 'var(--nb-night)', letterSpacing: '-0.015em' }}>
                {r.name}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nb-stone)' }}>
                {r.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center p-10 rounded-2xl" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-light)' }}>
          <h2 className="font-display mb-3" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}>
            We come to your home
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--nb-stone)' }}>
            Free measurement and sample consultation. No showroom visit needed.
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
