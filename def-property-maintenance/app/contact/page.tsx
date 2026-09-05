import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, MessageSquare, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact DEF Property Maintenance',
  description: 'Contact DEF Property Maintenance. Start a property consultation to connect with Dylan Eric Francisco — serving Kawarthas, Muskoka, and surrounding areas.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-narrow py-16">

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="copper-line" />
            <span className="eyebrow">Get in Touch</span>
            <span className="copper-line" />
          </div>
          <h1
            className="font-display mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}
          >
            Contact DEF
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--def-stone)', lineHeight: '1.65' }}>
            The best way to reach Dylan is through the consultation form — it gives him the property
            details he needs to respond quickly and accurately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto mb-12">
          {[
            {
              icon: Calendar,
              title: 'Start a Consultation',
              desc: 'Tell us about your property and needs. Dylan will follow up directly.',
              href: '/consultation',
              label: 'Start Consultation',
              primary: true,
            },
            {
              icon: MessageSquare,
              title: 'Ask DEF AI',
              desc: 'Have a quick question? DEF AI can answer general property questions instantly.',
              href: '/def-ai',
              label: 'Ask DEF AI',
              primary: false,
            },
            {
              icon: MapPin,
              title: 'Service Area',
              desc: 'Kawarthas, Muskoka, Peterborough, and surrounding areas. Not sure? Ask us.',
              href: '/about#service-areas',
              label: 'View Service Areas',
              primary: false,
            },
          ].map(({ icon: Icon, title, desc, href, label, primary }) => (
            <div
              key={title}
              className="card-def p-6 text-center flex flex-col items-center"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(168,120,64,0.1)' }}
              >
                <Icon size={22} style={{ color: 'var(--def-copper)' }} />
              </div>
              <h2 className="font-display text-lg mb-2" style={{ color: 'var(--def-night)', letterSpacing: '-0.01em' }}>
                {title}
              </h2>
              <p className="text-sm mb-5 flex-1" style={{ color: 'var(--def-stone)', lineHeight: '1.6' }}>
                {desc}
              </p>
              <Link
                href={href}
                className={primary ? 'btn-primary text-sm py-2.5 px-5' : 'btn-ghost text-sm py-2.5 px-5'}
              >
                {label}
              </Link>
            </div>
          ))}
        </div>

        <div
          className="max-w-lg mx-auto text-center p-6 rounded-2xl border"
          style={{ background: 'rgba(22,28,45,0.03)', borderColor: 'var(--border-light)' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
            Contact information (phone, email) is provided directly to clients after consultation.
            DEF does not list personal contact information publicly. For urgent property emergencies,
            call 911 or your local emergency services.
          </p>
        </div>

      </div>
    </div>
  );
}
