import Link from 'next/link';
import { ArrowRight, Calendar, CheckCircle, MapPin } from 'lucide-react';

const STEPS = [
  'Tell us about your property and needs',
  'DEF AI qualifies your request',
  'Dylan reviews and confirms the scope',
  'We schedule and show up',
];

export default function ConsultationCTA() {
  return (
    <section className="section-y relative overflow-hidden" style={{ background: 'var(--def-night)' }}>
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(240,242,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(240,242,246,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,120,64,0.12) 0%, transparent 70%)' }}
      />

      <div className="container-narrow relative z-10 text-center">

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="copper-line" />
          <span className="eyebrow">Start Here</span>
          <span className="copper-line" />
        </div>

        <h2
          className="font-display text-white mb-5"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', letterSpacing: '-0.03em', lineHeight: '1.05' }}
        >
          Start a property
          <br />
          <span style={{ color: 'var(--def-copper)' }}>consultation</span>
        </h2>

        <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: 'rgba(155,163,184,0.75)', lineHeight: '1.65' }}>
          Tell us about your property. We&apos;ll figure out the right service, timing, and approach together.
        </p>

        <ul className="flex flex-col sm:grid sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-12 text-left">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(168,120,64,0.2)', color: 'var(--def-copper)', fontFamily: 'var(--font-label)' }}
              >
                {i + 1}
              </div>
              <span className="text-sm" style={{ color: 'rgba(155,163,184,0.75)' }}>{step}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/consultation" className="btn-primary gap-2 text-base py-4 px-8">
            <Calendar size={17} />
            Start Property Consultation
          </Link>
          <Link href="/def-ai" className="btn-ghost gap-2">
            Ask DEF AI First <ArrowRight size={15} />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          <MapPin size={13} style={{ color: 'var(--def-sage)' }} />
          <span className="text-sm" style={{ color: 'rgba(155,163,184,0.45)', fontFamily: 'var(--font-label)' }}>
            Serving Kawarthas • Muskoka • Surrounding Areas
          </span>
        </div>

      </div>
    </section>
  );
}
