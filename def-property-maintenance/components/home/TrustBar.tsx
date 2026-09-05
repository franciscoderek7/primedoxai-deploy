import { MapPin, Eye, Wrench, Cpu } from 'lucide-react';

const ITEMS = [
  { icon: MapPin, label: 'Local Service', detail: 'Kawarthas, Muskoka & area' },
  { icon: Wrench, label: 'Property Maintenance', detail: 'Cottage care & upkeep' },
  { icon: Eye, label: 'Security-Focused', detail: 'Inspection & monitoring' },
  { icon: Cpu, label: 'AI Property 360™', detail: 'Smart property intelligence' },
];

export default function TrustBar() {
  return (
    <section className="relative py-8 border-y" style={{ background: 'rgba(22,28,45,0.04)', borderColor: 'var(--border-light)' }}>
      <div className="container-def">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[var(--border-light)]">
          {ITEMS.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="flex items-center gap-4 px-0 lg:px-8 first:lg:pl-0 last:lg:pr-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(168,120,64,0.1)' }}
              >
                <Icon size={18} style={{ color: 'var(--def-copper)' }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--def-night)', fontFamily: 'var(--font-label)' }}>
                  {label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--def-smoke)' }}>
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
