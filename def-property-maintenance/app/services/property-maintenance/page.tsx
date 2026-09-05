import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Property Maintenance — DEF Property Maintenance',
  description: 'Year-round property maintenance for cottage country and residential properties — seasonal preparation, repairs, exterior and interior maintenance, emergency response, and contractor coordination.',
};

const DETAILS = [
  { category: 'Seasonal Preparation', items: ['Spring property opening and inspection', 'Fall weatherization and winterization prep', 'Seasonal system checks (HVAC, water, drainage)', 'Pre-season exterior walkthrough'] },
  { category: 'General Repairs', items: ['Minor carpentry and structural repairs', 'Plumbing minor repairs and fixture maintenance', 'Door and window adjustment and sealing', 'General interior maintenance tasks'] },
  { category: 'Exterior Maintenance', items: ['Deck and fence inspection and repair', 'Gutter cleaning and downspout check', 'Drainage management', 'Driveway and walkway maintenance'] },
  { category: 'Contractor Coordination', items: ['Coordination with licensed tradespeople', 'Oversight of third-party work on your behalf', 'Quote management and project scheduling', 'Work quality verification and reporting'] },
  { category: 'Emergency Response', items: ['Storm damage assessment', 'Emergency site visit and damage documentation', 'Temporary protective measures', 'Incident reporting to owner with photos'] },
];

export default function PropertyMaintenancePage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-def py-16">

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,120,64,0.1)' }}>
              <Wrench size={20} style={{ color: 'var(--def-copper)' }} />
            </div>
            <div className="eyebrow">DEF Services</div>
          </div>
          <h1 className="font-display mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}>
            Property Maintenance
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--def-stone)', lineHeight: '1.65' }}>
            Year-round property upkeep for cottage country and residential properties — from seasonal
            preparation to emergency response. Dylan manages the details so you don&apos;t have to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {DETAILS.map(({ category, items }) => (
            <div key={category} className="card-def p-6">
              <h2 className="font-display text-lg mb-4" style={{ color: 'var(--def-night)', letterSpacing: '-0.01em' }}>
                {category}
              </h2>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--def-stone)' }}>
                    <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--def-copper)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/consultation" className="btn-primary gap-2">
            Start Property Consultation <ArrowRight size={14} />
          </Link>
          <Link href="/services" className="btn-ghost">View all services</Link>
        </div>

      </div>
    </div>
  );
}
