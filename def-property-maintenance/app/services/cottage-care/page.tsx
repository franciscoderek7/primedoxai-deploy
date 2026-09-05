import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cottage Care — DEF Property Maintenance',
  description: 'Professional cottage care for seasonal properties in the Kawarthas and Muskoka — spring opening, fall closing, regular check-ins, storm response, and key management.',
};

const DETAILS = [
  { category: 'Spring Opening', items: ['Water system startup and pressure check', 'Appliance inspection and test', 'Exterior post-winter assessment', 'Pest evidence check', 'Photo report to owner'] },
  { category: 'Fall Closing', items: ['Winterization of water systems', 'Appliance shutdown and prep', 'Property securing and lock check', 'Exterior furniture storage (if applicable)', 'Closing condition report with photos'] },
  { category: 'In-Season Check-Ins', items: ['Scheduled welfare visits between owner visits', 'Photo condition reports', 'Perimeter security check', 'Storm and weather response', 'Key holder and access management'] },
  { category: 'Storm & Emergency Response', items: ['Post-storm site visit', 'Damage assessment and documentation', 'Temporary protective measures', 'Contractor coordination for urgent repairs', 'Owner notification with full photo report'] },
];

export default function CottageCarePage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-def py-16">

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,120,64,0.1)' }}>
              <Home size={20} style={{ color: 'var(--def-copper)' }} />
            </div>
            <div className="eyebrow">DEF Services</div>
          </div>
          <h1 className="font-display mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}>
            Cottage Care
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--def-stone)', lineHeight: '1.65' }}>
            Opening, closing, and ongoing caretaking for seasonal cottage properties.
            DEF manages your cottage between visits so you arrive to a property that&apos;s
            ready and secure.
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
