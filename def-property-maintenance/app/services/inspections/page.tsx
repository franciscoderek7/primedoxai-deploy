import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Property Inspections — DEF Property Maintenance',
  description: 'Professional property inspection visits for vacant, seasonal, and investment properties — welfare checks, condition reports with photos, security walkthroughs, and insurance visits.',
};

const DETAILS = [
  { category: 'Welfare Checks', items: ['Scheduled vacancy checks on your timeline', 'Interior and exterior condition assessment', 'Systems check (visible plumbing, heating, windows)', 'Pest and intrusion evidence check', 'Immediate notification of any issues found'] },
  { category: 'Condition Reports', items: ['Comprehensive photo documentation', 'Written condition summary', 'Comparison to previous inspection baseline', 'Priority issue flagging', 'Delivered digitally to property owner'] },
  { category: 'Security Walkthroughs', items: ['Entry point vulnerability assessment', 'Lock and window condition check', 'Lighting and perimeter review', 'Access point documentation', 'Recommendations for improvements'] },
  { category: 'Insurance & Pre-Sale', items: ['Insurance-requested inspection visits', 'Pre-sale condition documentation', 'Post-storm damage assessment', 'Written reports formatted for insurance claims', 'Neutral third-party documentation'] },
];

export default function InspectionsPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-def py-16">

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,120,64,0.1)' }}>
              <Search size={20} style={{ color: 'var(--def-copper)' }} />
            </div>
            <div className="eyebrow">DEF Services</div>
          </div>
          <h1 className="font-display mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}>
            Property Inspections
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--def-stone)', lineHeight: '1.65' }}>
            Detailed condition and welfare inspections for vacant, seasonal, and investment properties.
            Know what&apos;s happening at your property even when you&apos;re not there.
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
