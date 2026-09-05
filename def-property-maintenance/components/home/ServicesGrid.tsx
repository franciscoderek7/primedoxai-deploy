import Link from 'next/link';
import { ArrowRight, Wrench, Home, Lock, Eye, Search, Cpu } from 'lucide-react';

const SERVICES = [
  {
    icon: Wrench,
    title: 'Property Maintenance',
    href: '/services/property-maintenance',
    desc: 'Year-round property upkeep — seasonal prep, repairs, general maintenance for homes and cottages.',
    accent: 'var(--def-copper)',
  },
  {
    icon: Home,
    title: 'Cottage Care',
    href: '/services/cottage-care',
    desc: 'Seasonal opening and closing, caretaking, check-ins, and property oversight for your cottage.',
    accent: 'var(--def-sage)',
  },
  {
    icon: Search,
    title: 'Property Inspections',
    href: '/services/inspections',
    desc: 'Detailed property inspections for vacant properties, seasonal properties, and pre-purchase assessment.',
    accent: 'var(--def-copper)',
  },
  {
    icon: Lock,
    title: 'Locksmith Services',
    href: '/services/locksmith',
    desc: 'Lock installation, re-keying, and access solutions for residential and commercial properties.',
    accent: 'var(--def-stone)',
  },
  {
    icon: Eye,
    title: 'Security-Focused Services',
    href: '/services/security',
    desc: 'Security-oriented property assessments, vulnerability walkthroughs, and smart access recommendations.',
    accent: 'var(--def-copper)',
  },
  {
    icon: Cpu,
    title: 'Smart Property Technology',
    href: '/property-360',
    desc: 'AI Property 360™ — smart monitoring, environmental sensing, and property intelligence platforms.',
    accent: 'var(--def-copper)',
    badge: 'AI Property 360™',
  },
];

export default function ServicesGrid() {
  return (
    <section className="section-y" style={{ background: 'var(--surface-page)' }}>
      <div className="container-def">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="copper-line" />
              <span className="eyebrow">What We Do</span>
            </div>
            <h2
              className="font-display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}
            >
              Complete property care
              <br />
              for cottage country
            </h2>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70 flex-shrink-0"
            style={{ color: 'var(--def-copper)', fontFamily: 'var(--font-label)' }}
          >
            All services <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="card-def group flex flex-col p-7 no-underline"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(168,120,64,0.1)' }}
                >
                  <s.icon size={20} style={{ color: s.accent }} />
                </div>
                {s.badge && (
                  <span
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: 'rgba(168,120,64,0.1)',
                      color: 'var(--def-copper)',
                      fontFamily: 'var(--font-label)',
                      letterSpacing: '0.05em',
                      border: '1px solid rgba(168,120,64,0.2)',
                    }}
                  >
                    {s.badge}
                  </span>
                )}
              </div>

              <h3
                className="font-display mb-2 transition-colors"
                style={{ fontSize: '1.25rem', letterSpacing: '-0.01em', color: 'var(--def-night)' }}
              >
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--def-stone)' }}>
                {s.desc}
              </p>
              <div
                className="flex items-center gap-2 mt-5 text-sm font-semibold transition-all group-hover:gap-3"
                style={{ color: s.accent, fontFamily: 'var(--font-label)' }}
              >
                Learn more
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
