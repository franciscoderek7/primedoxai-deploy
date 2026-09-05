import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Locksmith Services — DEF Property Maintenance',
  description: 'Lock installation, re-keying, smart lock setup, and access solutions for residential and commercial properties in the Kawarthas and Muskoka areas.',
};

const DETAILS = [
  { category: 'Lock Installation & Replacement', items: ['New lock installation', 'Deadbolt upgrades and reinforcement', 'Hardware replacement and retrofits', 'Exterior door lock assessment', 'Lock-out prevention consultation'] },
  { category: 'Re-keying & Access Management', items: ['Re-keying — same locks, new keys', 'Master key systems for multi-unit properties', 'Key duplication management', 'Tenant changeover re-keying', 'Emergency lockout assistance'] },
  { category: 'Smart Locks', items: ['Smart lock selection and installation', 'Keypad and app-based lock setup', 'Temporary access code management', 'Smart lock integration with AI Property 360™', 'Access log configuration'] },
];

export default function LocksmithPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-def py-16">

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,120,64,0.1)' }}>
              <Lock size={20} style={{ color: 'var(--def-copper)' }} />
            </div>
            <div className="eyebrow">DEF Services</div>
          </div>
          <h1 className="font-display mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}>
            Locksmith Services
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--def-stone)', lineHeight: '1.65' }}>
            Lock installation, re-keying, smart lock setup, and access solutions for residential
            and commercial properties.
          </p>
        </div>

        <div
          className="text-sm px-5 py-4 rounded-xl border mb-10 max-w-2xl"
          style={{ background: 'rgba(168,120,64,0.05)', borderColor: 'rgba(168,120,64,0.2)', color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}
        >
          Locksmith services are provided by or with qualified personnel. Service scope and availability
          are confirmed at consultation. Not all services are available in all locations.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
