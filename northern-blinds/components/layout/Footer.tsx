import Link from 'next/link';

const PRODUCT_LINKS = [
  { label: 'Blinds & Shades', href: '/products/blinds-shades' },
  { label: 'Windows', href: '/products/windows' },
  { label: 'Doors', href: '/products/doors' },
  { label: 'Motorized Systems', href: '/products/motorized' },
];

const SERVICE_LINKS = [
  { label: 'Residential', href: '/residential' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'Cottage & Seasonal', href: '/cottage' },
  { label: 'Free Consultation', href: '/consultation' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Service Areas', href: '/about#service-areas' },
  { label: 'Northern AI', href: '/northern-ai' },
  { label: 'Contact', href: '/contact' },
];

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'var(--nb-night)' }}
    >
      {/* Subtle gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, var(--nb-gold), transparent)',
          opacity: 0.3,
        }}
      />

      <div className="container-nb py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              <div
                className="font-display text-white text-2xl tracking-wide mb-1"
                style={{ letterSpacing: '0.04em' }}
              >
                NORTHERN BLINDS
              </div>
              <div
                className="text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--nb-gold)', letterSpacing: '0.18em' }}
              >
                Custom Blinds · Windows · Doors
              </div>
            </div>
            <p
              className="text-sm leading-relaxed mb-6 max-w-[280px]"
              style={{ color: 'var(--nb-mist)' }}
            >
              Expert custom window treatments, windows, and doors. Designed for the
              way Northern Ontario lives — from Peterborough to Muskoka.
            </p>
            <Link href="/consultation" className="btn-primary text-sm">
              Free Consultation
            </Link>
          </div>

          {/* Products */}
          <div>
            <h3
              className="eyebrow mb-5"
              style={{ color: 'rgba(184,176,166,0.5)' }}
            >
              Products
            </h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors"
                    style={{
                      color: 'var(--nb-mist)',
                      fontFamily: 'var(--font-label)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = '#fff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'var(--nb-mist)')
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3
              className="eyebrow mb-5"
              style={{ color: 'rgba(184,176,166,0.5)' }}
            >
              Services
            </h3>
            <ul className="space-y-3">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors"
                    style={{
                      color: 'var(--nb-mist)',
                      fontFamily: 'var(--font-label)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = '#fff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'var(--nb-mist)')
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3
              className="eyebrow mb-5"
              style={{ color: 'rgba(184,176,166,0.5)' }}
            >
              Company
            </h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors"
                    style={{
                      color: 'var(--nb-mist)',
                      fontFamily: 'var(--font-label)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = '#fff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'var(--nb-mist)')
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="hr-nb mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-xs" style={{ color: 'rgba(184,176,166,0.45)', fontFamily: 'var(--font-label)' }}>
              © {new Date().getFullYear()} Northern Blinds. All rights reserved.
            </p>
            <span className="hidden md:block text-white/10">·</span>
            <Link
              href="/privacy"
              className="text-xs transition-colors"
              style={{ color: 'rgba(184,176,166,0.45)', fontFamily: 'var(--font-label)' }}
            >
              Privacy Policy
            </Link>
          </div>
          <div className="fhi-designation text-center md:text-right">
            A Francisco Holdings Inc. Production — Empire Tower — Floor 17
          </div>
        </div>
      </div>
    </footer>
  );
}
