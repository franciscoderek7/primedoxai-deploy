import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Shield, Cpu, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About DEF Property Maintenance — Dylan Eric Francisco',
  description:
    'DEF Property Maintenance is a cottage country property care and security-focused specialist company founded by Dylan Eric Francisco, serving Kawarthas, Muskoka, and surrounding areas.',
};

const SERVICE_AREAS = [
  'Kawarthas', 'Muskoka', 'Peterborough', 'Lindsay', 'Haliburton',
  'Bobcaygeon', 'Fenelon Falls', 'Minden', 'Bracebridge', 'Huntsville',
  'Gravenhurst', 'Bancroft',
];

const VALUES = [
  {
    icon: MapPin,
    title: 'Local & Accountable',
    desc: 'Dylan lives and works in the region. When you call DEF, you reach the person doing the work — not a national call centre.',
  },
  {
    icon: Shield,
    title: 'Security-Minded',
    desc: 'Every property engagement is assessed through a security lens. Vulnerabilities are flagged, access is managed, and your property is protected.',
  },
  {
    icon: Cpu,
    title: 'Technology-Enabled',
    desc: 'AI Property 360™ extends what one person can monitor and manage — allowing Dylan to provide property intelligence at scale.',
  },
  {
    icon: Users,
    title: 'Human at the Core',
    desc: 'AI supports the work — it does not replace the judgment, reliability, and direct accountability that comes with a human service provider.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>

      {/* Header */}
      <section className="section-y" style={{ background: 'var(--def-slate)' }}>
        <div className="container-narrow text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="copper-line" />
            <span className="eyebrow">About DEF</span>
            <span className="copper-line" />
          </div>
          <h1
            className="font-display text-white mb-5"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', letterSpacing: '-0.025em', lineHeight: '1.1' }}
          >
            DEF Property Maintenance
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(155,163,184,0.8)' }}>
            Cottage Country Property Maintenance & Security-Focused Specialists —
            serving the Kawarthas, Muskoka, and surrounding areas with hands-on
            expertise and smart property technology.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="section-y">
        <div className="container-def">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="copper-line" />
                <span className="eyebrow">The Founder</span>
              </div>
              <h2
                className="font-display mb-4"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: '1.1', color: 'var(--def-night)' }}
              >
                Dylan Eric Francisco
              </h2>
              <p className="text-base leading-relaxed mb-5" style={{ color: 'var(--def-stone)' }}>
                Dylan founded DEF Property Maintenance to bring professional property care and
                security-focused expertise to cottage country homeowners and commercial property owners
                who need a trusted local partner.
              </p>
              <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--def-stone)' }}>
                With AI Property 360™, DEF delivers the kind of continuous property intelligence
                that used to require a large team — giving clients round-the-clock visibility
                into their property backed by Dylan&apos;s direct, personal accountability.
              </p>
              <Link href="/consultation" className="btn-primary">
                Start a Consultation
              </Link>
            </div>
            <div
              className="p-8 rounded-2xl border"
              style={{
                background: 'rgba(22,28,45,0.04)',
                borderColor: 'var(--border-copper)',
              }}
            >
              <div className="eyebrow mb-3">DEF Property Maintenance</div>
              <div className="font-display text-2xl mb-1" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>
                Dylan Eric Francisco
              </div>
              <div className="text-sm mb-6" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
                Founder & Operator
              </div>
              <div className="space-y-3 text-sm" style={{ color: 'var(--def-stone)' }}>
                <div className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: 'var(--def-sage)' }} />
                  <span>Kawarthas • Muskoka • Surrounding Areas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={14} style={{ color: 'var(--def-copper)' }} />
                  <span>Property Maintenance & Security-Focused Specialist</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu size={14} style={{ color: 'var(--def-copper)' }} />
                  <span>AI Property 360™ — Smart Property Technology</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <div className="text-xs" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}>
                  Contact information available upon consultation request.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-y" style={{ background: 'var(--surface-muted)' }}>
        <div className="container-def">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="copper-line" />
              <span className="eyebrow">How We Work</span>
              <span className="copper-line" />
            </div>
            <h2
              className="font-display"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', color: 'var(--def-night)' }}
            >
              What DEF stands for
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-6 rounded-2xl border"
                style={{ borderColor: 'var(--border-light)', background: 'white' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(168,120,64,0.1)' }}
                >
                  <Icon size={22} style={{ color: 'var(--def-copper)' }} />
                </div>
                <h3 className="font-display text-lg mb-2" style={{ color: 'var(--def-night)', letterSpacing: '-0.01em' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--def-stone)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service areas */}
      <section id="service-areas" className="section-y">
        <div className="container-def">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="copper-line" />
                <span className="eyebrow">Service Territory</span>
              </div>
              <h2
                className="font-display mb-5"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: '1.1', color: 'var(--def-night)' }}
              >
                Kawarthas, Muskoka
                <br />& surrounding areas
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--def-stone)' }}>
                DEF serves a broad cottage country territory. Remote and seasonal
                properties are welcome — that&apos;s where we specialize. Not sure
                if we cover your area? Ask us.
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
                  style={{ background: 'rgba(168,120,64,0.08)', borderColor: 'rgba(168,120,64,0.25)', color: 'var(--def-copper)' }}
                >
                  + surrounding areas
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}>
                * Service availability varies by location and project type. Contact us to confirm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FHI connection */}
      <section className="pb-16">
        <div className="container-narrow">
          <div
            className="text-center p-8 rounded-2xl border"
            style={{ background: 'rgba(22,28,45,0.04)', borderColor: 'var(--border-light)' }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
              DEF Property Maintenance is powered by Francisco Holdings Inc. technology infrastructure —
              including AI advisory systems, platform architecture, and strategic support.
              DEF serves its own customers independently and does not expose internal FHI systems.
            </p>
            <div className="fhi-designation mt-4">
              A Francisco Holdings Inc. Production — Empire Tower — Floor 17
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
