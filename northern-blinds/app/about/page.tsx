import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Shield, Ruler, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Northern Blinds — Custom Window Treatments for Northern Ontario',
  description:
    'Northern Blinds is a custom blinds, windows, and doors company serving the Kawarthas, Muskoka, Peterborough, and surrounding areas of Northern Ontario.',
};

const SERVICE_AREAS = [
  'Peterborough', 'Kawarthas', 'Lindsay', 'Haliburton', 'Muskoka',
  'Bancroft', 'Bobcaygeon', 'Fenelon Falls', 'Minden', 'Bracebridge',
  'Huntsville', 'Gravenhurst',
];

const VALUES = [
  {
    icon: Ruler,
    title: 'Precision Matters',
    desc: 'Every installation starts with a professional measurement. Nothing is left to guesswork.',
  },
  {
    icon: Shield,
    title: 'Honest Guidance',
    desc: 'We recommend what fits your needs and budget — not whatever carries the highest margin.',
  },
  {
    icon: Heart,
    title: 'Built for This Region',
    desc: 'We understand Northern Ontario living — seasonal cottages, harsh winters, lakefront design.',
  },
  {
    icon: MapPin,
    title: 'We Come to You',
    desc: 'No showroom visit required. We bring the samples, the expertise, and the measuring tape.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>

      {/* Hero */}
      <section className="section-y" style={{ background: 'var(--nb-night)' }}>
        <div className="container-narrow text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="gold-line" />
            <span className="eyebrow">Our Story</span>
            <span className="gold-line" />
          </div>
          <h1
            className="font-display text-white mb-6"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', letterSpacing: '-0.025em', lineHeight: '1.1' }}
          >
            Northern Blinds
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(184,176,166,0.8)' }}>
            Custom blinds, windows, and doors — designed for the way Northern Ontario lives.
            From Peterborough homes to lakefront Muskoka cottages, we bring expert craftsmanship
            and honest guidance directly to your door.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section-y">
        <div className="container-nb">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="gold-line" />
              <span className="eyebrow">How We Work</span>
              <span className="gold-line" />
            </div>
            <h2
              className="font-display"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}
            >
              What sets us apart
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-6 rounded-2xl border"
                style={{ borderColor: 'var(--border-light)', background: 'white' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(201,160,85,0.1)' }}
                >
                  <Icon size={22} style={{ color: 'var(--nb-gold)' }} />
                </div>
                <h3
                  className="font-display text-lg mb-2"
                  style={{ color: 'var(--nb-night)', letterSpacing: '-0.01em' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--nb-stone)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service areas */}
      <section
        id="service-areas"
        className="section-y"
        style={{ background: 'var(--surface-muted)' }}
      >
        <div className="container-nb">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="gold-line" />
                <span className="eyebrow">Where We Serve</span>
              </div>
              <h2
                className="font-display mb-5"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', color: 'var(--nb-night)', lineHeight: '1.1' }}
              >
                Kawarthas, Muskoka
                <br />& beyond
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--nb-stone)' }}>
                We serve a broad territory across central and Northern Ontario.
                Not sure if we cover your area? Ask us — if we can get to you,
                we will.
              </p>
              <Link href="/consultation" className="btn-primary">
                Check My Area
              </Link>
            </div>
            <div>
              <div className="flex flex-wrap gap-2.5 mb-4">
                {SERVICE_AREAS.map((a) => (
                  <span key={a} className="area-badge">
                    <MapPin size={11} />
                    {a}
                  </span>
                ))}
                <span
                  className="area-badge"
                  style={{ background: 'rgba(201,160,85,0.08)', borderColor: 'rgba(201,160,85,0.25)', color: 'var(--nb-gold)' }}
                >
                  + surrounding areas
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--nb-mist)', fontFamily: 'var(--font-label)' }}>
                * Service availability varies by location and project type.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-y" style={{ background: 'var(--nb-forest)' }}>
        <div className="container-narrow text-center">
          <h2
            className="font-display text-white mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}
          >
            Ready to get started?
          </h2>
          <p className="text-base mb-8" style={{ color: 'rgba(184,176,166,0.75)' }}>
            Free in-home consultation, no obligation. We come to you.
          </p>
          <Link href="/consultation" className="btn-primary">
            Book Free Consultation
          </Link>
        </div>
      </section>

    </div>
  );
}
