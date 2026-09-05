import Link from 'next/link';
import { ArrowRight, Cpu, Camera, Thermometer, Droplets, Zap, Lock, Bell } from 'lucide-react';

const SENSORS = [
  { icon: Camera, label: 'Cameras', status: 'Active' },
  { icon: Thermometer, label: 'Temperature', status: 'Normal' },
  { icon: Droplets, label: 'Water Detection', status: 'Clear' },
  { icon: Lock, label: 'Access Control', status: 'Secured' },
  { icon: Zap, label: 'Power Monitor', status: 'Online' },
  { icon: Bell, label: 'Alerts', status: '0 Active' },
];

export default function Property360Teaser() {
  return (
    <section className="section-y relative overflow-hidden" style={{ background: 'var(--def-slate)' }}>
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[45vw] h-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 100% 40%, rgba(168,120,64,0.07) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[35vw] h-[50%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(26,46,28,0.35) 0%, transparent 70%)' }} />

      <div className="container-def relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="copper-line" />
              <span className="eyebrow">Smart Property Technology</span>
            </div>

            <h2
              className="font-display text-white mb-3"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.025em', lineHeight: '1.1' }}
            >
              AI Property 360™
            </h2>
            <p
              className="font-display italic mb-6"
              style={{ fontSize: '1.1rem', color: 'rgba(168,120,64,0.85)', letterSpacing: '-0.01em' }}
            >
              24/7 Property Intelligence & Smart Monitoring
            </p>

            <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(155,163,184,0.85)' }}>
              AI Property 360™ is DEF&apos;s smart property platform — connecting cameras, sensors,
              access control, and environmental monitoring into a unified property intelligence system.
              Know what&apos;s happening at your property, even when you&apos;re not there.
            </p>

            <ul className="space-y-2.5 mb-10">
              {[
                'Real-time property monitoring and alerts',
                'Environmental sensing — temperature, water, power',
                'Smart access control and entry logging',
                'Property intelligence reports delivered to you',
                'Human DEF team responds to events',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(155,163,184,0.7)' }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--def-copper)' }} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href="/property-360" className="btn-primary gap-2">
                <Cpu size={16} />
                Explore AI Property 360™
              </Link>
              <Link href="/consultation" className="btn-ghost gap-2">
                Get Started <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right — mock dashboard */}
          <div>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'rgba(13,20,33,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              {/* Dashboard header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div>
                  <div className="text-xs font-semibold text-white" style={{ fontFamily: 'var(--font-label)', letterSpacing: '0.06em' }}>
                    AI PROPERTY 360™
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'rgba(155,163,184,0.5)' }}>
                    Property Overview — [PLACEHOLDER PROPERTY]
                  </div>
                </div>
                <div className="status-online text-[10px] py-1">
                  <span className="status-dot-green" />
                  LIVE
                </div>
              </div>

              {/* Sensor grid */}
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SENSORS.map(({ icon: Icon, label, status }) => (
                  <div
                    key={label}
                    className="tech-card flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={15} style={{ color: 'var(--def-copper)', opacity: 0.8 }} />
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(74,112,88,0.15)',
                          color: 'var(--def-sage)',
                          fontFamily: 'var(--font-label)',
                          border: '1px solid rgba(74,112,88,0.25)',
                        }}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white/70" style={{ fontFamily: 'var(--font-label)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert feed */}
              <div className="px-5 pb-5">
                <div
                  className="rounded-xl border p-4 text-center"
                  style={{ background: 'rgba(74,112,88,0.06)', borderColor: 'rgba(74,112,88,0.15)' }}
                >
                  <div className="text-[11px] font-semibold" style={{ color: 'var(--def-sage)', fontFamily: 'var(--font-label)', letterSpacing: '0.08em' }}>
                    ALL SYSTEMS NORMAL
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: 'rgba(155,163,184,0.45)' }}>
                    Last check: [LIVE DATA PLACEHOLDER]
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-center mt-4" style={{ color: 'rgba(155,163,184,0.35)', fontFamily: 'var(--font-label)' }}>
              Dashboard preview — live data available after AI Property 360™ setup
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
