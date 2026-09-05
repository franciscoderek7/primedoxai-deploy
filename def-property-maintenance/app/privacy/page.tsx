import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — DEF Property Maintenance',
  description: 'Privacy policy for DEF Property Maintenance — how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-narrow py-16">

        <div className="mb-10">
          <div className="eyebrow mb-3">Legal</div>
          <h1 className="font-display mb-4" style={{ fontSize: '2.25rem', letterSpacing: '-0.025em', color: 'var(--def-night)' }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
            Effective date: 2026-01-01 — DEF Property Maintenance / Francisco Holdings Inc.
          </p>
        </div>

        <div className="prose-def space-y-8">
          {[
            {
              title: '1. Who we are',
              body: `DEF Property Maintenance is a property care and security-focused specialist company founded by Dylan Eric Francisco, operating in the Kawarthas, Muskoka, and surrounding areas of Ontario, Canada. DEF Property Maintenance is powered by Francisco Holdings Inc. technology infrastructure.`,
            },
            {
              title: '2. Information we collect',
              body: `We collect information you provide directly through our consultation form: name, email address, phone number (optional), property location, and details about the services you are requesting. We also collect information you provide through DEF AI conversations. We do not collect payment information through this website. We do not purchase or import third-party data about you.`,
            },
            {
              title: '3. How we use your information',
              body: `We use your information to: respond to your consultation request, contact you to confirm scope and scheduling, and provide the services you have engaged us for. We do not use your information for advertising, retargeting, or resale. We do not sell your data to third parties.`,
            },
            {
              title: '4. Legal basis (PIPEDA / Canadian privacy law)',
              body: `We collect and process your information on the basis of your consent, which you provide when you submit a consultation request. You may withdraw consent at any time by contacting us. Withdrawal of consent may mean we are unable to provide the requested services.`,
            },
            {
              title: '5. Data retention',
              body: `We retain consultation records for a period reasonably necessary to fulfill the services requested and to comply with applicable legal and accounting obligations. When data is no longer needed, it is deleted or anonymised. You may request deletion of your data at any time.`,
            },
            {
              title: '6. AI Property 360™ and monitoring data',
              body: `If you engage DEF Property Maintenance for AI Property 360™ monitoring services, data from your property's monitoring systems (sensor readings, access logs, camera events) is collected and processed for the sole purpose of providing property monitoring services to you. This data is not shared with third parties except where necessary to provide the service (e.g., alert routing systems). Data collected from physical monitoring systems is described in a separate service agreement.`,
            },
            {
              title: '7. DEF AI conversations',
              body: `Conversations with DEF AI are processed using the Anthropic AI API. Conversation content may be processed by Anthropic in accordance with their usage policies. We do not store the full content of DEF AI conversations indefinitely. DEF AI is an informational tool only — it is not a licensed advisor and does not provide legal, safety, or emergency guidance.`,
            },
            {
              title: '8. Cookies and tracking',
              body: `This website does not use tracking cookies or third-party analytics beyond what is provided by the hosting platform. We do not use advertising pixels or social media tracking.`,
            },
            {
              title: '9. Data security',
              body: `We take reasonable technical and organizational measures to protect your personal information. However, no internet transmission is completely secure. We recommend you do not submit sensitive personal information beyond what is necessary for your consultation request.`,
            },
            {
              title: '10. Your rights',
              body: `You have the right to: access the personal information we hold about you, correct inaccurate information, request deletion of your information, and withdraw consent. To exercise any of these rights, please start a consultation request and indicate your privacy request in the notes field, or contact us through the website.`,
            },
            {
              title: '11. Children',
              body: `Our services are not directed to children under 18. We do not knowingly collect personal information from children.`,
            },
            {
              title: '12. Changes to this policy',
              body: `We may update this policy from time to time. The effective date at the top of this page will reflect the most recent update. Continued use of the website after a policy update constitutes acceptance of the updated policy.`,
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-display text-lg mb-2" style={{ color: 'var(--def-night)', letterSpacing: '-0.01em' }}>
                {title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--def-stone)' }}>
                {body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
