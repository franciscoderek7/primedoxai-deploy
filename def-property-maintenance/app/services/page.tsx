import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench, Home, Lock, Eye, Search, Cpu, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services — Property Maintenance, Cottage Care & Security-Focused Services',
  description:
    'DEF Property Maintenance offers property maintenance, cottage care, property inspections, locksmith services, and security-focused property services across Kawarthas & Muskoka.',
};

const SERVICES = [
  {
    icon: Wrench,
    title: 'Property Maintenance',
    href: '/services/property-maintenance',
    shortDesc: 'Year-round property upkeep — repairs, seasonal preparation, general maintenance.',
    details: [
      'Seasonal property preparation (spring & fall)',
      'General repairs and preventive maintenance',
      'Exterior maintenance — decks, fences, drainage',
      'Interior maintenance — fixtures, caulking, weatherproofing',
      'Emergency response for property issues',
      'Contractor coordination and oversight',
    ],
  },
  {
    icon: Home,
    title: 'Cottage Care',
    href: '/services/cottage-care',
    shortDesc: 'Opening, closing, and ongoing caretaking for seasonal cottage properties.',
    details: [
      'Spring opening — water systems, appliance check, exterior inspection',
      'Fall closing — winterization, securing the property',
      'Regular in-season check-ins with photo reports',
      'Storm response and damage assessment',
      'Maintenance scheduling and contractor supervision',
      'Key holder and access management',
    ],
  },
  {
    icon: Search,
    title: 'Property Inspections',
    href: '/services/inspections',
    shortDesc: 'Detailed property inspections for vacant, seasonal, and investment properties.',
    details: [
      'Vacant property welfare checks',
      'Scheduled condition reports with photos',
      'Security vulnerability walkthrough',
      'Pre-sale condition documentation',
      'Insurance-requested inspection visits',
      'Post-storm damage assessment',
    ],
  },
  {
    icon: Lock,
    title: 'Locksmith Services',
    href: '/services/locksmith',
    shortDesc: 'Lock installation, re-keying, and access solutions for residential and commercial.',
    details: [
      'Lock installation and replacement',
      'Re-keying — same locks, new keys',
      'Smart lock installation and setup',
      'Deadbolt upgrades and reinforcement',
      'Master key systems for multi-unit properties',
      'Emergency lockout assistance',
    ],
    note: 'Locksmith services are provided by or with qualified personnel. Service scope confirmed at consultation.',
  },
  {
    icon: Eye,
    title: 'Security-Focused Services',
    href: '/services/security',
    shortDesc: 'Security-oriented property assessments and smart access recommendations.',
    details: [
      'Property security walkthrough and vulnerability assessment',
      'Access control recommendations',
      'Camera placement consultation',
      'Perimeter security assessment',
      'AI Property 360™ setup and configuration',
      'Ongoing property monitoring coordination',
    ],
    note: 'DEF provides security-focused property services. We do not offer police or emergency response, licensed alarm monitoring, or security guard services.',
  },
  {
    icon: Cpu,
    title: 'Smart Property Technology',
    href: '/property-360',
    shortDesc: 'AI Property 360™ — connected monitoring, sensors, smart access, and property intelligence.',
    details: [
      'Property monitoring system design and installation',
      'Camera systems integration',
      'Environmental sensor deployment',
      'Smart lock and access control setup',
      'AI Property 360™ platform onboarding',
      'Ongoing monitoring and alert management',
    ],
    badge: 'AI Property 360™',
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-def py-16">

        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="copper-line" />
            <span className="eyebrow">What We Do</span>
            <span className="copper-line" />
          </div>
          <h1
            className="font-display mb-4"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}
          >
            DEF Services
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--def-stone)', lineHeight: '1.65' }}>
            Complete property care for cottage country — from hands-on maintenance to smart technology.
          </p>
        </div>

        <div className="space-y-6">
          {SERVICES.map((s) => (
            <div key={s.href} className="card-def p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start gap-6">

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(168,120,64,0.1)' }}
                >
                  <s.icon size={22} style={{ color: 'var(--def-copper)' }} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2
                      className="font-display text-2xl"
                      style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}
                    >
                      {s.title}
                    </h2>
                    {s.badge && (
                      <span
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: 'rgba(168,120,64,0.1)',
                          color: 'var(--def-copper)',
                          fontFamily: 'var(--font-label)',
                          border: '1px solid rgba(168,120,64,0.2)',
                        }}
                      >
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-base mb-5" style={{ color: 'var(--def-stone)' }}>
                    {s.shortDesc}
                  </p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-5">
                    {s.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm" style={{ color: 'var(--def-stone)' }}>
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--def-copper)' }} />
                        {d}
                      </li>
                    ))}
                  </ul>

                  {s.note && (
                    <div
                      className="text-xs px-4 py-3 rounded-lg mb-4"
                      style={{ background: 'rgba(168,120,64,0.06)', color: 'var(--def-smoke)', fontFamily: 'var(--font-label)', border: '1px solid rgba(168,120,64,0.15)' }}
                    >
                      {s.note}
                    </div>
                  )}

                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                    style={{ color: 'var(--def-copper)', fontFamily: 'var(--font-label)' }}
                  >
                    Learn more <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm mb-6" style={{ color: 'var(--def-stone)' }}>
            Not sure what you need? Start a property consultation and we&apos;ll figure it out together.
          </p>
          <Link href="/consultation" className="btn-primary">
            Start Property Consultation
          </Link>
        </div>

      </div>
    </div>
  );
}
