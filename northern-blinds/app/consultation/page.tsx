import type { Metadata } from 'next';
import ConsultationForm from '@/components/consultation/ConsultationForm';

export const metadata: Metadata = {
  title: 'Free In-Home Consultation — Northern Blinds',
  description:
    'Book your free no-obligation consultation. We come to you, measure your windows, bring samples, and provide a detailed quote.',
};

export default function ConsultationPage() {
  return (
    <div
      className="min-h-screen pt-20"
      style={{ background: 'var(--surface-page)' }}
    >
      <div className="container-narrow py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="gold-line" />
            <span className="eyebrow">No Obligation</span>
            <span className="gold-line" />
          </div>
          <h1
            className="font-display mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              letterSpacing: '-0.025em',
              lineHeight: '1.1',
              color: 'var(--nb-night)',
            }}
          >
            Book Your Free
            <br />
            In-Home Consultation
          </h1>
          <p
            className="text-base leading-relaxed max-w-md mx-auto"
            style={{ color: 'var(--nb-stone)' }}
          >
            We come to you — free measurement, real samples, honest advice.
            No showroom trip. No pressure.
          </p>
        </div>

        <ConsultationForm />

      </div>
    </div>
  );
}
