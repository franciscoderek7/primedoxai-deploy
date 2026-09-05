import { Shield, Ruler, Clock, Wrench } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Ruler,
    label: 'Free Measurement',
    detail: 'Professional in-home measuring',
  },
  {
    icon: Wrench,
    label: 'Expert Installation',
    detail: 'Installed right the first time',
  },
  {
    icon: Shield,
    label: 'Quality Guaranteed',
    detail: 'Products built to last',
  },
  {
    icon: Clock,
    label: 'Responsive Service',
    detail: 'Prompt quotes and follow-up',
  },
];

export default function TrustBar() {
  return (
    <section
      className="relative py-8 border-y"
      style={{
        background: 'rgba(26,46,32,0.04)',
        borderColor: 'var(--border-light)',
      }}
    >
      <div className="container-nb">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[var(--border-light)]">
          {TRUST_ITEMS.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="flex items-center gap-4 px-0 lg:px-8 first:lg:pl-0 last:lg:pr-0"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,160,85,0.1)' }}
              >
                <Icon size={18} style={{ color: 'var(--nb-gold)' }} />
              </div>
              <div>
                <div
                  className="text-sm font-semibold"
                  style={{
                    color: 'var(--nb-night)',
                    fontFamily: 'var(--font-label)',
                  }}
                >
                  {label}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--nb-driftwood)' }}
                >
                  {detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
