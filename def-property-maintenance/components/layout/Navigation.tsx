'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Shield } from 'lucide-react';

const NAV_LINKS = [
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Property Maintenance', href: '/services/property-maintenance' },
      { label: 'Cottage Care', href: '/services/cottage-care' },
      { label: 'Property Inspections', href: '/services/inspections' },
      { label: 'Locksmith Services', href: '/services/locksmith' },
      { label: 'Security-Focused Services', href: '/services/security' },
    ],
  },
  { label: 'AI Property 360™', href: '/property-360' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
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
    if (mobileOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-dark border-b border-white/5 shadow-glass' : 'bg-transparent'
        }`}
      >
        <div className="container-def">
          <nav className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none group">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--def-copper)', opacity: 0.9 }}
                >
                  <Shield size={14} className="text-white" />
                </div>
                <span
                  className="font-display text-white text-lg font-bold tracking-wide transition-opacity group-hover:opacity-80"
                  style={{ letterSpacing: '0.02em' }}
                >
                  DEF
                </span>
              </div>
              <span
                className="text-[9px] tracking-widest uppercase mt-0.5 pl-9"
                style={{ color: 'rgba(168,120,64,0.8)', letterSpacing: '0.16em' }}
              >
                Property Maintenance
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
                          size={13}
                          className={`transition-transform ${openDropdown === link.href ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {openDropdown === link.href && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 min-w-[220px]">
                          <div className="glass-dark rounded-xl border border-white/8 py-2 shadow-glass">
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
                href="/def-ai"
                className="text-sm font-medium tracking-wide transition-colors"
                style={{ color: 'var(--def-copper)', fontFamily: 'var(--font-label)' }}
              >
                DEF AI
              </Link>
              <Link href="/consultation" className="btn-primary text-sm py-2.5 px-5">
                Start Consultation
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
        <div className="fixed inset-0 z-40 flex flex-col pt-20" style={{ background: 'var(--def-night)' }}>
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3.5 text-lg font-semibold text-white/80 hover:text-white border-b border-white/6 transition-colors font-display"
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
                            className="block py-2.5 text-sm text-white/50 hover:text-white/80 transition-colors"
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
              <Link href="/consultation" className="btn-primary text-center" onClick={() => setMobileOpen(false)}>
                Start Consultation
              </Link>
              <Link href="/def-ai" className="btn-ghost text-center" onClick={() => setMobileOpen(false)}>
                Talk to DEF AI
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
