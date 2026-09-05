import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'blinds-shades',
    title: 'Blinds & Shades',
    tagline: 'Light. Privacy. Style.',
    description:
      'Roller shades, cellular blinds, wood blinds, roman shades, and motorized systems — precision-fitted to every window in your home.',
    href: '/products/blinds-shades',
    accent: 'var(--nb-gold)',
    bgFrom: 'rgba(201,160,85,0.06)',
    bgTo: 'rgba(201,160,85,0.01)',
  },
  {
    id: 'windows',
    title: 'Windows',
    tagline: 'Energy. Clarity. Craft.',
    description:
      'Energy-efficient casement, double-hung, awning, and picture windows. Built for Northern Ontario winters — sealed tight, looking sharp.',
    href: '/products/windows',
    accent: 'var(--nb-sage)',
    bgFrom: 'rgba(77,124,94,0.06)',
    bgTo: 'rgba(77,124,94,0.01)',
  },
  {
    id: 'doors',
    title: 'Doors',
    tagline: 'Entry. Patio. Security.',
    description:
      'Steel, fibreglass, and patio doors. Front entries that make a statement, patio doors that open your home to the lake.',
    href: '/products/doors',
    accent: 'var(--nb-driftwood)',
    bgFrom: 'rgba(107,94,82,0.08)',
    bgTo: 'rgba(107,94,82,0.01)',
  },
];

export default function ProductCategories() {
  return (
    <section className="section-y" style={{ background: 'var(--surface-page)' }}>
      <div className="container-nb">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="gold-line" />
              <span className="eyebrow">What We Do</span>
            </div>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                letterSpacing: '-0.025em',
                lineHeight: '1.1',
                color: 'var(--nb-night)',
              }}
            >
              Everything your windows
              <br />
              and doors need
            </h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70 flex-shrink-0"
            style={{ color: 'var(--nb-gold)', fontFamily: 'var(--font-label)' }}
          >
            View all products
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="card-nb group flex flex-col p-8 no-underline"
              style={{
                background: `linear-gradient(145deg, ${cat.bgFrom}, ${cat.bgTo})`,
              }}
            >
              {/* Category number */}
              <div
                className="text-[10px] font-bold tracking-widest mb-6 opacity-30"
                style={{
                  fontFamily: 'var(--font-label)',
                  color: cat.accent,
                  letterSpacing: '0.2em',
                }}
              >
                0{CATEGORIES.indexOf(cat) + 1}
              </div>

              {/* Title */}
              <h3
                className="font-display mb-2 transition-colors"
                style={{
                  fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                  letterSpacing: '-0.02em',
                  color: 'var(--nb-night)',
                }}
              >
                {cat.title}
              </h3>

              {/* Tagline */}
              <div
                className="text-sm font-semibold mb-4 tracking-wide"
                style={{ color: cat.accent, fontFamily: 'var(--font-label)' }}
              >
                {cat.tagline}
              </div>

              {/* Description */}
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: 'var(--nb-stone)' }}
              >
                {cat.description}
              </p>

              {/* CTA arrow */}
              <div
                className="flex items-center gap-2 mt-6 text-sm font-semibold transition-all group-hover:gap-3"
                style={{ color: cat.accent, fontFamily: 'var(--font-label)' }}
              >
                Learn more
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
