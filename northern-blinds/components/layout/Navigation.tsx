'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'Blinds & Shades', href: '/products/blinds-shades' },
      { label: 'Windows', href: '/products/windows' },
      { label: 'Doors', href: '/products/doors' },
    ],
  },
  {
    label: 'Residential',
    href: '/residential',
  },
  {
    label: 'Commercial',
    href: '/commercial',
  },
  {
    label: 'Cottage & Seasonal',
    href: '/cottage',
  },
  {
    label: 'About',
    href: '/about',
  },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-dark border-b border-white/5 shadow-glass'
            : 'bg-transparent'
        }`}
      >
        <div className="container-nb">
          <nav className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none group">
              <span
                className="font-display text-white text-xl tracking-wide transition-opacity group-hover:opacity-80"
                style={{ letterSpacing: '0.04em' }}
              >
                NORTHERN BLINDS
              </span>
              <span
                className="text-[10px] tracking-widest uppercase mt-0.5"
                style={{ color: 'var(--nb-gold)', letterSpacing: '0.18em' }}
              >
                Custom Blinds · Windows · Doors
              </span>
            </Link>

            {/* Desktop nav */}
            <ul className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.children && setOpenDropdown(link.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {link.children ? (
                    <>
                      <button
                        className="flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium tracking-wide transition-colors"
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        {link.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${openDropdown === link.href ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {openDropdown === link.href && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 min-w-[200px]">
                          <div className="glass-dark rounded-xl border border-white/10 py-2 shadow-glass">
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                style={{ fontFamily: 'var(--font-label)' }}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white text-sm font-medium tracking-wide transition-colors"
                      style={{ fontFamily: 'var(--font-label)' }}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/northern-ai"
                className="text-sm font-medium tracking-wide transition-colors"
                style={{ color: 'var(--nb-gold)', fontFamily: 'var(--font-label)' }}
              >
                Ask Northern AI
              </Link>
              <Link href="/consultation" className="btn-primary text-sm py-2.5 px-5">
                Free Consultation
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-nb-night pt-20">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3.5 text-lg font-medium text-white/80 hover:text-white border-b border-white/8 transition-colors font-display"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <ul className="pl-4 pb-2">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2.5 text-base text-white/55 hover:text-white/90 transition-colors"
                            style={{ fontFamily: 'var(--font-label)' }}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/consultation"
                className="btn-primary text-center"
                onClick={() => setMobileOpen(false)}
              >
                Free Consultation
              </Link>
              <Link
                href="/northern-ai"
                className="btn-ghost text-center"
                onClick={() => setMobileOpen(false)}
              >
                Ask Northern AI
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
