import Link from 'next/link';
import { Shield, MapPin } from 'lucide-react';

const SERVICE_LINKS = [
  { label: 'Property Maintenance', href: '/services/property-maintenance' },
  { label: 'Cottage Care', href: '/services/cottage-care' },
  { label: 'Property Inspections', href: '/services/inspections' },
  { label: 'Locksmith Services', href: '/services/locksmith' },
  { label: 'Security-Focused Services', href: '/services/security' },
];

const TECH_LINKS = [
  { label: 'AI Property 360™', href: '/property-360' },
  { label: 'DEF AI', href: '/def-ai' },
  { label: 'Property Consultation', href: '/consultation' },
];

const COMPANY_LINKS = [
  { label: 'About DEF', href: '/about' },
  { label: 'Service Areas', href: '/about#service-areas' },
  { label: 'Contact', href: '/contact' },
  { label: 'Digital Business Card', href: '/card' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: 'var(--def-night)' }}>
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--def-copper), transparent)', opacity: 0.25 }}
      />

      <div className="container-def py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(168,120,64,0.2)' }}
              >
                <Shield size={18} style={{ color: 'var(--def-copper)' }} />
              </div>
              <div>
                <div className="font-display text-white text-xl font-bold" style={{ letterSpacing: '0.02em' }}>
                  DEF
                </div>
                <div className="text-[9px] tracking-widest uppercase" style={{ color: 'rgba(168,120,64,0.7)', letterSpacing: '0.16em' }}>
                  Property Maintenance
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-3 max-w-[280px]" style={{ color: 'var(--def-mist)' }}>
              Cottage Country Property Maintenance & Security-Focused Specialists.
            </p>
            <div className="flex items-center gap-1.5 mb-6">
              <MapPin size={12} style={{ color: 'var(--def-sage)' }} />
              <span className="text-xs" style={{ color: 'var(--def-sage)', fontFamily: 'var(--font-label)' }}>
                Kawarthas • Muskoka • Surrounding Areas
              </span>
            </div>
            <Link href="/consultation" className="btn-primary text-sm">
              Start Consultation
            </Link>
          </div>

          {/* Services */}
          <div>
            <h3 className="eyebrow mb-5" style={{ color: 'rgba(155,163,184,0.5)' }}>Services</h3>
            <ul className="space-y-3">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--def-mist)')}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="eyebrow mb-5" style={{ color: 'rgba(155,163,184,0.5)' }}>Technology</h3>
            <ul className="space-y-3">
              {TECH_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--def-mist)')}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="eyebrow mb-5" style={{ color: 'rgba(155,163,184,0.5)' }}>Company</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--def-mist)')}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="hr-def mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-xs" style={{ color: 'rgba(155,163,184,0.4)', fontFamily: 'var(--font-label)' }}>
              © {new Date().getFullYear()} DEF Property Maintenance. All rights reserved.
            </p>
            <span className="hidden md:block text-white/10">·</span>
            <span className="text-xs italic" style={{ color: 'rgba(155,163,184,0.3)', fontFamily: 'var(--font-label)' }}>
              AI Property 360™ is a DEF technology brand.
            </span>
          </div>
          <div className="fhi-designation text-center md:text-right">
            A Francisco Holdings Inc. Production — Empire Tower — Floor 17
          </div>
        </div>
      </div>
    </footer>
  );
}
