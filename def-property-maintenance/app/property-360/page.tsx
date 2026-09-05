import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Camera, Thermometer, Droplets, Zap, Lock, Bell, Eye, Cpu, Wifi, Sun } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Property 360™ — Smart Property Intelligence & Monitoring',
  description:
    'AI Property 360™ by DEF Property Maintenance — connected property monitoring for cameras, temperature, water detection, access control, and smart alerts for cottage country properties.',
};

const TECH_CATEGORIES = [
  {
    icon: Camera,
    title: 'Cameras & Visual Monitoring',
    desc: 'Property camera systems providing visual oversight of entry points, driveways, and key property areas. Feeds accessible through the AI Property 360™ platform.',
    status: 'Architecture Ready',
  },
  {
    icon: Thermometer,
    title: 'Temperature & Environmental',
    desc: 'Indoor and outdoor temperature sensing. Critical for cottage properties where frozen pipes or overheating can cause significant damage in your absence.',
    status: 'Architecture Ready',
  },
  {
    icon: Droplets,
    title: 'Water & Flood Detection',
    desc: 'Sensor-based water intrusion detection for basements, mechanical rooms, and crawl spaces. Early detection prevents costly damage.',
    status: 'Architecture Ready',
  },
  {
    icon: Lock,
    title: 'Smart Access Control',
    desc: 'Smart lock integration and access logging. Know who enters your property and when. Temporary access codes for contractors and guests.',
    status: 'Architecture Ready',
  },
  {
    icon: Zap,
    title: 'Power & Connectivity',
    desc: 'Power outage detection and generator monitoring. Network connectivity watchdog to ensure the monitoring system stays online.',
    status: 'Architecture Ready',
  },
  {
    icon: Sun,
    title: 'Environmental Monitoring',
    desc: 'Smoke, CO, and air quality sensing. Humidity monitoring for cottage interiors and storage areas.',
    status: 'Architecture Ready',
  },
  {
    icon: Bell,
    title: 'Alerts & Notifications',
    desc: 'Intelligent alert routing — critical events wake the DEF team immediately. Routine status delivered as daily or weekly summaries.',
    status: 'Architecture Ready',
  },
  {
    icon: Wifi,
    title: 'Connectivity & Redundancy',
    desc: 'Cellular backup connectivity ensures monitoring continues even if your cottage internet fails. Important for remote properties.',
    status: 'Architecture Ready',
  },
  {
    icon: Eye,
    title: 'Property Intelligence Reports',
    desc: 'Regular AI-generated property intelligence summaries delivered to you. What happened, what was checked, what needs attention.',
    status: 'Architecture Ready',
  },
];

const CUSTOMER_JOURNEY = [
  { step: '01', title: 'Property Profile', desc: 'You create a property profile — location, type, systems, access, monitoring preferences.' },
  { step: '02', title: 'DEF Assessment', desc: 'Dylan\'s team assesses your property and recommends the right monitoring configuration.' },
  { step: '03', title: 'Hardware Setup', desc: 'DEF installs and configures the monitoring hardware. All devices verified and commissioned.' },
  { step: '04', title: 'AI Property 360™ Live', desc: 'Your property goes live on the platform. Alerts are configured, baseline is set.' },
  { step: '05', title: 'Continuous Monitoring', desc: 'AI monitors your property around the clock. Events trigger alerts or scheduled reports.' },
  { step: '06', title: 'DEF Human Response', desc: 'Critical alerts route to Dylan\'s team. They verify, investigate, and act — then report back to you.' },
];

export default function Property360Page() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--def-night)' }}>

      {/* Hero */}
      <section className="section-y relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[50vw] h-full"
          style={{ background: 'radial-gradient(ellipse at 100% 30%, rgba(168,120,64,0.08) 0%, transparent 70%)' }}
        />
        <div className="container-narrow relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="copper-line" />
            <span className="eyebrow">Smart Property Technology</span>
            <span className="copper-line" />
          </div>
          <h1
            className="font-display text-white mb-3"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em', lineHeight: '1.0' }}
          >
            AI Property 360™
          </h1>
          <p className="font-display italic mb-6" style={{ fontSize: '1.25rem', color: 'rgba(168,120,64,0.85)' }}>
            24/7 Property Intelligence & Smart Monitoring
          </p>
          <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: 'rgba(155,163,184,0.8)', lineHeight: '1.65' }}>
            AI Property 360™ is DEF Property Maintenance&apos;s smart property platform — connecting cameras,
            sensors, access control, and environmental monitoring into unified property intelligence.
            Know what&apos;s happening at your property, all the time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/consultation" className="btn-primary gap-2">
              <Cpu size={16} />
              Start Property Consultation
            </Link>
            <Link href="/def-ai" className="btn-ghost gap-2">
              Ask DEF AI <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Tech grid */}
      <section className="pb-24 relative" style={{ background: 'var(--def-slate)' }}>
        <div className="container-def">
          <div className="text-center mb-12 pt-20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="copper-line" />
              <span className="eyebrow">Platform Architecture</span>
              <span className="copper-line" />
            </div>
            <h2
              className="font-display text-white"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}
            >
              What AI Property 360™ monitors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_CATEGORIES.map((cat) => (
              <div key={cat.title} className="tech-card flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(168,120,64,0.15)' }}
                  >
                    <cat.icon size={18} style={{ color: 'var(--def-copper)' }} />
                  </div>
                  <span
                    className="text-[9px] font-semibold px-2 py-1 rounded-full"
                    style={{
                      background: 'rgba(58,64,96,0.4)',
                      color: 'var(--def-mist)',
                      fontFamily: 'var(--font-label)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {cat.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-white text-base mb-2" style={{ letterSpacing: '-0.01em' }}>
                    {cat.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(155,163,184,0.7)' }}>
                    {cat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-8 p-4 rounded-xl border text-center"
            style={{
              background: 'rgba(168,120,64,0.05)',
              borderColor: 'rgba(168,120,64,0.15)',
            }}
          >
            <p className="text-sm" style={{ color: 'rgba(155,163,184,0.6)' }}>
              Specific hardware compatibility and supported devices are confirmed during your DEF property assessment.
              Architecture is extensible — additional devices and integrations are added as the platform grows.
            </p>
          </div>
        </div>
      </section>

      {/* Customer journey */}
      <section className="section-y" style={{ background: 'var(--def-night)' }}>
        <div className="container-def">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="copper-line" />
              <span className="eyebrow">How It Works</span>
              <span className="copper-line" />
            </div>
            <h2
              className="font-display text-white"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}
            >
              From consultation to live monitoring
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CUSTOMER_JOURNEY.map((j) => (
              <div
                key={j.step}
                className="p-6 rounded-2xl border"
                style={{ background: 'rgba(22,28,45,0.6)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="text-[11px] font-bold mb-4 font-display"
                  style={{ color: 'var(--def-copper)', letterSpacing: '0.1em' }}
                >
                  STEP {j.step}
                </div>
                <h3 className="font-display text-white text-lg mb-2" style={{ letterSpacing: '-0.01em' }}>
                  {j.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(155,163,184,0.7)' }}>
                  {j.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="container-narrow text-center">
          <h2 className="font-display text-white mb-4" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
            Ready to monitor your property?
          </h2>
          <p className="text-base mb-8" style={{ color: 'rgba(155,163,184,0.7)' }}>
            Start with a property consultation. Dylan&apos;s team will assess your property and design the right monitoring setup.
          </p>
          <Link href="/consultation" className="btn-primary gap-2">
            Start Property Consultation <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  );
}
