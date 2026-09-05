import type { Metadata } from 'next';
import DEFAIChat from '@/components/def-ai/DEFAIChat';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'DEF AI — Property Concierge',
  description: 'Ask DEF AI about property maintenance, cottage care, security-focused services, and AI Property 360™ smart monitoring. Get instant answers and find the right DEF service for your property.',
};

export default function DEFAIPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--def-night)' }}>
      <div className="container-narrow py-12">

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="copper-line" />
            <span className="eyebrow">Property Concierge</span>
            <span className="copper-line" />
          </div>
          <h1
            className="font-display text-white mb-3"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em' }}
          >
            DEF AI
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(155,163,184,0.75)', lineHeight: '1.65' }}>
            Have a property question? Ask DEF AI. It can help you understand our services,
            identify what your property might need, and get you ready for a consultation with Dylan.
          </p>
        </div>

        <DEFAIChat />

        <div className="mt-8 text-center">
          <p className="text-sm mb-4" style={{ color: 'rgba(155,163,184,0.5)' }}>
            Ready to talk specifics?
          </p>
          <Link href="/consultation" className="btn-primary gap-2">
            Start Property Consultation <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
}
