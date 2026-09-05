import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cottage & Seasonal — Window Treatments for Muskoka & Kawarthas Cottages',
  description:
    'Blinds, shades, and window treatments built for cottage life — lakefront views, UV protection, seasonal installation, and motorized convenience.',
};

const COTTAGE_FEATURES = [
  {
    title: 'Lakefront Views',
    desc: 'Solar shades with 5–10% openness preserve your view of the water while cutting afternoon glare. See the lake — not the sun.',
  },
  {
    title: 'UV Protection',
    desc: 'UV-blocking fabrics protect furniture, flooring, and artwork from fading during long summer days on south- and west-facing walls.',
  },
  {
    title: 'Motorized Convenience',
    desc: 'Reach those high cathedral-ceiling windows without a ladder. Schedule shades to lower at peak sun hours — even from your phone.',
  },
  {
    title: 'Seasonal Humidity',
    desc: 'Moisture-resistant faux wood and aluminum products that handle the humidity swings between spring opening and fall closing.',
  },
  {
    title: 'Easy Cleaning',
    desc: 'Roller and cellular shades wipe clean. Important when kids and wet dogs are part of the cottage equation.',
  },
  {
    title: 'Privacy from the Water',
    desc: 'Sheer day layers that give you privacy from passing boats without blocking natural light — so you feel private but not boxed in.',
  },
];

export default function CottagePage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-nb py-16">

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="gold-line" />
            <span className="eyebrow">Cottage & Seasonal</span>
          </div>
          <h1
            className="font-display mb-4"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--nb-night)' }}
          >
            Built for cottage life
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--nb-stone)', lineHeight: '1.65' }}>
            Northern Ontario cottages have unique demands — humidity, seasonal opening and closing,
            spectacular views to preserve, and sun angles that change dramatically through the day.
            We know the Kawarthas and Muskoka, and we spec products that work here.
          </p>
        </div>

        <div
          className="p-5 rounded-xl border mb-10"
          style={{ background: 'rgba(77,124,94,0.06)', borderColor: 'rgba(77,124,94,0.2)' }}
        >
          <p className="text-sm" style={{ color: 'var(--nb-stone)' }}>
            <strong style={{ color: 'var(--nb-sage)' }}>We travel to you:</strong>{' '}
            Many of our cottage clients are in Haliburton, Bobcaygeon, Fenelon Falls, Minden, Bracebridge, and beyond.
            We schedule cottage visits and work around seasonal access. Ask about availability when you book.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {COTTAGE_FEATURES.map((f) => (
            <div key={f.title} className="card-nb p-6">
              <h2 className="font-display text-xl mb-2" style={{ color: 'var(--nb-night)', letterSpacing: '-0.015em' }}>
                {f.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nb-stone)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <div
          className="text-center p-10 rounded-2xl relative overflow-hidden"
          style={{ background: 'var(--nb-forest)' }}
        >
          <h2 className="font-display text-white mb-3" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
            Plan your cottage windows now
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(184,176,166,0.75)' }}>
            Spring and summer booking fills quickly. Schedule your consultation early.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/consultation" className="btn-primary">Book Cottage Consultation</Link>
            <Link href="/northern-ai" className="btn-ghost gap-2">Ask Northern AI <ArrowRight size={15} /></Link>
          </div>
        </div>

      </div>
    </div>
  );
}
