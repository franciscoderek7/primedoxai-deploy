import { MapPin } from 'lucide-react';

const SERVICE_AREAS = [
  'Peterborough',
  'Kawarthas',
  'Lindsay',
  'Haliburton',
  'Muskoka',
  'Bancroft',
  'Bobcaygeon',
  'Fenelon Falls',
  'Minden',
  'Bracebridge',
  'Huntsville',
  'Gravenhurst',
];

export default function ServiceAreas() {
  return (
    <section
      className="section-y"
      style={{ background: 'var(--surface-muted)' }}
    >
      <div className="container-nb">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="gold-line" />
              <span className="eyebrow">Where We Serve</span>
            </div>

            <h2
              className="font-display mb-6"
              style={{
                fontSize: 'clamp(1.875rem, 3.5vw, 3rem)',
                letterSpacing: '-0.025em',
                lineHeight: '1.1',
                color: 'var(--nb-night)',
              }}
            >
              Serving Kawarthas,
              <br />
              Muskoka & beyond
            </h2>

            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: 'var(--nb-stone)' }}
            >
              From city-centre homes in Peterborough to remote lakefront cottages
              in Haliburton, we bring the showroom to you. Free in-home
              measurement and professional installation across the region.
            </p>

            <div
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{
                background: 'rgba(201,160,85,0.05)',
                borderColor: 'rgba(201,160,85,0.2)',
              }}
            >
              <MapPin size={18} style={{ color: 'var(--nb-gold)', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: 'var(--nb-stone)' }}>
                Not sure if we cover your area?{' '}
                <span style={{ color: 'var(--nb-gold)', fontWeight: 600 }}>
                  Ask Northern AI
                </span>{' '}
                or request a free consultation — we&apos;ll let you know right away.
              </p>
            </div>
          </div>

          {/* Right — area badges */}
          <div>
            <div className="flex flex-wrap gap-2.5">
              {SERVICE_AREAS.map((area) => (
                <span key={area} className="area-badge">
                  <MapPin size={11} />
                  {area}
                </span>
              ))}
              <span
                className="area-badge"
                style={{
                  background: 'rgba(201,160,85,0.08)',
                  borderColor: 'rgba(201,160,85,0.25)',
                  color: 'var(--nb-gold)',
                }}
              >
                + surrounding areas
              </span>
            </div>

            <p
              className="text-xs mt-6"
              style={{
                color: 'var(--nb-mist)',
                fontFamily: 'var(--font-label)',
              }}
            >
              * Service availability varies by location and project type. Contact us to confirm coverage for your area.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
