import Link from 'next/link';
import { ArrowRight, Calendar, CheckCircle } from 'lucide-react';

const CONSULTATION_STEPS = [
  'We come to you — free in-home measurement',
  'Explore samples and styles on-site',
  'Receive a detailed quote with no obligation',
  'Professional installation on your schedule',
];

export default function ConsultationCTA() {
  return (
    <section
      className="section-y relative overflow-hidden"
      style={{ background: 'var(--nb-forest)' }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Gold glow top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201,160,85,0.14) 0%, transparent 70%)',
        }}
      />

      <div className="container-narrow relative z-10 text-center">

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="gold-line" />
          <span className="eyebrow">No Obligation</span>
          <span className="gold-line" />
        </div>

        <h2
          className="font-display text-white mb-6"
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 4rem)',
            letterSpacing: '-0.03em',
            lineHeight: '1.05',
          }}
        >
          Start with a free
          <br />
          <span style={{ color: 'var(--nb-gold)' }}>in-home consultation</span>
        </h2>

        <p
          className="text-lg mb-10 max-w-xl mx-auto"
          style={{ color: 'rgba(184,176,166,0.75)', lineHeight: '1.65' }}
        >
          We bring the samples, the expertise, and the measurements to you.
          No showroom visit required.
        </p>

        {/* Steps */}
        <ul className="flex flex-col sm:grid sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-12 text-left">
          {CONSULTATION_STEPS.map((step) => (
            <li key={step} className="flex items-start gap-3">
              <CheckCircle
                size={17}
                className="flex-shrink-0 mt-0.5"
                style={{ color: 'var(--nb-gold)' }}
              />
              <span
                className="text-sm"
                style={{ color: 'rgba(184,176,166,0.8)', fontFamily: 'var(--font-body)' }}
              >
                {step}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/consultation" className="btn-primary gap-2 text-base py-4 px-8">
            <Calendar size={17} />
            Book My Free Consultation
          </Link>
          <Link
            href="/northern-ai"
            className="btn-ghost gap-2"
          >
            Ask a Question First
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
}
