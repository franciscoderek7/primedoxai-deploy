import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Northern Blinds',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-narrow py-16">
        <h1
          className="font-display mb-8"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}
        >
          Privacy Policy
        </h1>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: 'var(--nb-stone)' }}>

          <section>
            <h2 className="font-display text-xl mb-3" style={{ color: 'var(--nb-night)' }}>
              What we collect
            </h2>
            <p>
              When you submit a consultation request, we collect the contact information you provide
              (name, email, phone number, city) and the project details you share in the form.
              When you use Northern AI, your conversation messages are sent to our AI provider
              (Anthropic) to generate responses. We do not store chat transcripts.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl mb-3" style={{ color: 'var(--nb-night)' }}>
              How we use your information
            </h2>
            <p>
              Consultation request information is used solely to follow up with you about
              scheduling a visit and providing a quote. We do not sell or share your information
              with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl mb-3" style={{ color: 'var(--nb-night)' }}>
              Data storage
            </h2>
            <p>
              Consultation requests are transmitted via email to our team. We retain this
              information for the purpose of fulfilling your request. You may request deletion
              of your information at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl mb-3" style={{ color: 'var(--nb-night)' }}>
              Contact
            </h2>
            <p>
              For privacy questions or data deletion requests, use the consultation form
              and indicate your request in the notes field.
            </p>
          </section>

          <p className="text-sm" style={{ color: 'var(--nb-mist)', fontFamily: 'var(--font-label)' }}>
            Last updated: {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  );
}
