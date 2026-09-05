import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Users, Cpu, Wrench, Bell, BarChart3, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'DEF Command Center — Owner Dashboard',
  description: 'DEF Command Center — property operations dashboard for Dylan Eric Francisco.',
  robots: { index: false, follow: false },
};

const COUNCIL_ADVISORS = [
  {
    id: 'primedox',
    name: 'PrimeDox',
    role: 'Chief Document & Legal Officer',
    desc: 'Document integrity, legal compliance, contractual review.',
    status: 'Interface only — pending FHI_COUNCIL_ENDPOINT configuration',
  },
  {
    id: 'vigilax',
    name: 'Vigilax',
    role: 'Chief Security & Risk Officer',
    desc: 'Security boundary management, risk assessment, OMNIAGUARD integration.',
    status: 'Interface only — pending FHI_COUNCIL_ENDPOINT configuration',
  },
  {
    id: 'soulstack',
    name: 'SoulStack',
    role: 'Chief Strategy & Operations Officer',
    desc: 'Operational strategy, business intelligence, empire oversight.',
    status: 'Interface only — pending FHI_COUNCIL_ENDPOINT configuration',
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--def-night)' }}>
      <div className="container-def py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="eyebrow mb-2" style={{ color: 'var(--def-copper)' }}>DEF COMMAND CENTER</div>
            <h1 className="font-display text-white text-2xl" style={{ letterSpacing: '-0.02em' }}>
              Owner Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--def-smoke)' }}>Dylan Eric Francisco — DEF Property Maintenance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot-green" />
            <span className="text-xs" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}>System operational</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Users, label: 'View Leads', href: '/consultation', desc: 'Consultation requests' },
            { icon: Wrench, label: 'Active Projects', href: '/consultation', desc: 'In-progress work' },
            { icon: Cpu, label: 'AI Property 360™', href: '/property-360', desc: 'Monitoring platform' },
            { icon: Bell, label: 'Alerts', href: '#', desc: 'System notifications' },
          ].map(({ icon: Icon, label, href, desc }) => (
            <Link
              key={label}
              href={href}
              className="tech-card flex flex-col gap-3 hover:opacity-80 transition-opacity"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(168,120,64,0.15)' }}
              >
                <Icon size={18} style={{ color: 'var(--def-copper)' }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-label)' }}>{label}</div>
                <div className="text-xs" style={{ color: 'var(--def-smoke)' }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* FHI AI Council (interface stubs) */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={16} style={{ color: 'var(--def-copper)' }} />
            <h2 className="font-display text-white text-lg" style={{ letterSpacing: '-0.01em' }}>FHI AI Council</h2>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(58,64,96,0.5)', color: 'var(--def-mist)', fontFamily: 'var(--font-label)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Interface only
            </span>
          </div>
          <p className="text-xs mb-5" style={{ color: 'var(--def-smoke)' }}>
            FHI AI Council advisors are pending FHI_COUNCIL_ENDPOINT configuration.
            Human authority is required for all consequential actions — never auto-execute council recommendations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COUNCIL_ADVISORS.map(({ id, name, role, desc, status }) => (
              <div
                key={id}
                className="p-5 rounded-xl border opacity-60"
                style={{ background: 'rgba(22,28,45,0.6)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={12} style={{ color: 'var(--def-smoke)' }} />
                  <span className="font-display text-white text-sm">{name}</span>
                </div>
                <div className="text-xs mb-2" style={{ color: 'var(--def-copper)', fontFamily: 'var(--font-label)' }}>{role}</div>
                <p className="text-xs mb-3" style={{ color: 'var(--def-smoke)', lineHeight: '1.5' }}>{desc}</p>
                <div className="text-[10px]" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}>{status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform status */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={16} style={{ color: 'var(--def-copper)' }} />
            <h2 className="font-display text-white text-lg" style={{ letterSpacing: '-0.01em' }}>Platform Status</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Website', status: 'Architecture Ready', note: 'Next.js / Vercel' },
              { label: 'DEF AI', status: 'Architecture Ready', note: 'Anthropic API' },
              { label: 'Database', status: 'Pending DATABASE_URL', note: 'Supabase / PostgreSQL' },
              { label: 'Email Notifications', status: 'Pending RESEND_API_KEY', note: 'Resend' },
              { label: 'AI Property 360™', status: 'Architecture Ready', note: 'Platform configuration pending' },
              { label: 'FHI AI Council', status: 'Pending FHI_COUNCIL_ENDPOINT', note: 'Interface only' },
            ].map(({ label, status, note }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3 rounded-xl border"
                style={{ background: 'rgba(22,28,45,0.4)', borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div>
                  <div className="text-sm text-white" style={{ fontFamily: 'var(--font-label)' }}>{label}</div>
                  <div className="text-[10px]" style={{ color: 'var(--def-smoke)' }}>{note}</div>
                </div>
                <span
                  className="text-[10px] px-2.5 py-1 rounded-full"
                  style={{
                    background: status.startsWith('Pending') ? 'rgba(58,64,96,0.5)' : 'rgba(168,120,64,0.1)',
                    color: status.startsWith('Pending') ? 'var(--def-mist)' : 'var(--def-copper)',
                    fontFamily: 'var(--font-label)',
                    border: `1px solid ${status.startsWith('Pending') ? 'rgba(255,255,255,0.06)' : 'rgba(168,120,64,0.2)'}`,
                  }}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="fhi-designation mt-10">
          A Francisco Holdings Inc. Production — Empire Tower — Floor 17
        </div>

      </div>
    </div>
  );
}
