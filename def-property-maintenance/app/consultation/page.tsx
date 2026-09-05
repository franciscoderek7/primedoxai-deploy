import type { Metadata } from 'next';
import ConsultationForm from '@/components/consultation/ConsultationForm';

export const metadata: Metadata = {
  title: 'Start a Property Consultation — DEF Property Maintenance',
  description: 'Start a property consultation with DEF Property Maintenance. Tell us about your property and Dylan will follow up to confirm scope, timeline, and pricing.',
};

export default function ConsultationPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-narrow py-12">

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="copper-line" />
            <span className="eyebrow">Start Here</span>
            <span className="copper-line" />
          </div>
          <h1
            className="font-display mb-3"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}
          >
            Property Consultation
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--def-stone)', lineHeight: '1.65' }}>
            Tell us about your property and what you need. Dylan will review your request and
            follow up to discuss scope, timing, and next steps.
          </p>
        </div>

        <div className="card-def p-8 md:p-10 max-w-2xl mx-auto">
          <ConsultationForm />
        </div>

      </div>
    </div>
  );
}
