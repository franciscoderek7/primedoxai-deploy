'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, Shield, MapPin } from 'lucide-react';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden" aria-label="DEF Property Maintenance hero">

      {/* Background */}
      <div className="hero-bg">
        {/* Deep Muskoka slate gradient — replace with hero image */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(155deg, #0D1421 0%, #161C2D 30%, #1A2E1C 60%, #0D1421 100%)',
          }}
        />
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Copper light leak — top */}
        <div
          className="absolute top-0 right-0 w-[50vw] h-[45vh]"
          style={{
            background: 'radial-gradient(ellipse at 80% 0%, rgba(168,120,64,0.09) 0%, transparent 65%)',
          }}
        />
        {/* Forest glow — bottom left */}
        <div
          className="absolute bottom-0 left-0 w-[50vw] h-[50vh]"
          style={{
            background: 'radial-gradient(ellipse at 0% 100%, rgba(26,46,28,0.45) 0%, transparent 70%)',
          }}
        />
        {/* Subtle tech grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `linear-gradient(rgba(240,242,246,1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(240,242,246,1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 container-def pb-28 pt-40">

        {/* Eyebrow + status */}
        <div
          className={`flex flex-wrap items-center gap-4 mb-8 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="copper-line" />
            <span className="eyebrow">DEF Property Maintenance</span>
          </div>
          <div className="status-online">
            <span className="status-dot-green" />
            AI Property 360™ Active
          </div>
        </div>

        {/* Headline */}
        <h1
          className={`font-display text-white mb-4 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            lineHeight: '0.95',
            letterSpacing: '-0.03em',
            transitionDelay: '180ms',
          }}
        >
          Cottage Country
          <br />
          <span style={{ color: 'var(--def-copper)' }}>Property Care</span>
        </h1>

        {/* Supporting line */}
        <p
          className={`font-display italic text-white/60 mb-6 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ fontSize: 'clamp(1.1rem, 2vw, 1.6rem)', letterSpacing: '-0.01em', transitionDelay: '240ms' }}
        >
          Maintenance · Security · Smart Property Technology
        </p>

        {/* Territory */}
        <div
          className={`flex items-center gap-2 mb-10 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '300ms' }}
        >
          <MapPin size={14} style={{ color: 'var(--def-sage)' }} />
          <span className="text-sm" style={{ color: 'var(--def-sage)', fontFamily: 'var(--font-label)', letterSpacing: '0.05em' }}>
            Kawarthas • Muskoka • Surrounding Areas
          </span>
        </div>

        {/* Value prop */}
        <p
          className={`text-white/50 mb-12 max-w-lg transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ fontSize: 'clamp(1rem, 1.4vw, 1.1rem)', lineHeight: '1.65', transitionDelay: '360ms' }}
        >
          Local expertise and hands-on service — backed by AI Property 360™ for
          24/7 property intelligence, security-focused inspections, and smart monitoring.
        </p>

        {/* CTA cluster */}
        <div
          className={`flex flex-wrap gap-4 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '440ms' }}
        >
          <Link href="/consultation" className="btn-primary gap-2">
            Start a Property Consultation
            <ArrowRight size={16} />
          </Link>
          <Link href="/property-360" className="btn-ghost gap-2">
            <Cpu size={15} />
            Explore AI Property 360™
          </Link>
          <Link href="/contact" className="btn-ghost gap-2">
            <Shield size={15} />
            Contact DEF
          </Link>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-30">
        <span className="text-white text-[10px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-label)' }}>Scroll</span>
        <div className="scroll-indicator w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
      </div>

    </section>
  );
}
