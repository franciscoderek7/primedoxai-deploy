'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      aria-label="Northern Blinds hero"
    >
      {/* Background */}
      <div className="hero-bg">
        {/* Deep gradient stand-in — replace with hero image once supplied */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(145deg, #0D1117 0%, #1A2E20 35%, #2C1810 65%, #0D1117 100%)',
          }}
        />
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Gold light leak — top right */}
        <div
          className="absolute top-0 right-0 w-[60vw] h-[50vh]"
          style={{
            background:
              'radial-gradient(ellipse at 80% 0%, rgba(201,160,85,0.12) 0%, transparent 65%)',
          }}
        />
        {/* Forest light — bottom left */}
        <div
          className="absolute bottom-0 left-0 w-[45vw] h-[45vh]"
          style={{
            background:
              'radial-gradient(ellipse at 0% 100%, rgba(26,46,32,0.4) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 container-nb pb-28 pt-40">

        {/* Eyebrow */}
        <div
          className={`flex items-center gap-3 mb-8 transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <span className="gold-line" />
          <span className="eyebrow">Kawarthas · Muskoka · Peterborough</span>
        </div>

        {/* Headline */}
        <h1
          className={`font-display text-white mb-6 transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{
            fontSize: 'clamp(3.25rem, 8vw, 7.5rem)',
            lineHeight: '0.95',
            letterSpacing: '-0.03em',
            transitionDelay: '180ms',
          }}
        >
          Northern
          <br />
          <span style={{ color: 'var(--nb-gold)' }}>Blinds</span>
        </h1>

        {/* Sub-headline */}
        <p
          className={`font-display text-white/70 italic mb-10 transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
            letterSpacing: '-0.01em',
            transitionDelay: '260ms',
          }}
        >
          Custom Blinds · Windows · Doors
        </p>

        {/* Value line */}
        <p
          className={`text-white/55 mb-12 max-w-lg transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            fontSize: 'clamp(1rem, 1.4vw, 1.125rem)',
            lineHeight: '1.65',
            fontFamily: 'var(--font-body)',
            transitionDelay: '340ms',
          }}
        >
          Designed for the way Northern Ontario lives — from lakeside cottages to
          downtown storefronts. Expert measurement, precise installation, lasting quality.
        </p>

        {/* CTA cluster */}
        <div
          className={`flex flex-wrap gap-4 transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '420ms' }}
        >
          <Link href="/consultation" className="btn-primary gap-2">
            Start Your Free Consultation
            <ArrowRight size={16} />
          </Link>
          <Link href="/northern-ai" className="btn-ghost gap-2">
            <Sparkles size={16} />
            Ask Northern AI
          </Link>
          <Link href="/products" className="btn-ghost">
            Explore Products
          </Link>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40">
        <span
          className="text-white text-[10px] tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          Scroll
        </span>
        <div className="scroll-indicator w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
      </div>

    </section>
  );
}
