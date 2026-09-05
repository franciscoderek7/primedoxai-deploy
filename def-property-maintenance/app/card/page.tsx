import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Shield, Cpu, Calendar, MessageSquare, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dylan Eric Francisco — DEF Property Maintenance',
  description: 'Digital business card for Dylan Eric Francisco, Founder of DEF Property Maintenance — Cottage Country Property Maintenance & Security-Focused Specialists.',
};

const SERVICES = [
  'Property Maintenance',
  'Cottage Care',
  'Property Inspections',
  'Locksmith Services',
  'Security-Focused Services',
  'AI Property 360™',
];

export default function CardPage() {
  const publicUrl = process.env.DEF_PUBLIC_URL ?? 'https://defpropertymaintenance.ca';

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Dylan Eric Francisco',
    'ORG:DEF Property Maintenance',
    'TITLE:Founder & Operator',
    'URL:' + publicUrl,
    'NOTE:Cottage Country Property Maintenance & Security-Focused Specialists. Serving Kawarthas\\, Muskoka & surrounding areas. AI Property 360™ smart monitoring.',
    'END:VCARD',
  ].join('\r\n');

  const vcardDataUri = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'var(--def-night)' }}>
      <div className="w-full max-w-sm">

        {/* Card front */}
        <div
          className="rounded-2xl p-8 mb-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--def-slate) 0%, var(--def-graphite) 100%)',
            border: '1px solid rgba(168,120,64,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Subtle background grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(240,242,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(240,242,246,1) 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
          {/* Copper glow */}
          <div
            className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(168,120,64,0.1) 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            <div className="eyebrow text-xs mb-5" style={{ color: 'var(--def-copper)' }}>DEF PROPERTY MAINTENANCE</div>

            <div className="mb-6">
              <div className="font-display text-2xl text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                Dylan Eric Francisco
              </div>
              <div className="text-sm" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
                Founder & Operator
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--def-mist)' }}>
                <MapPin size={14} style={{ color: 'var(--def-sage)', flexShrink: 0 }} />
                <span>Kawarthas • Muskoka • Surrounding Areas</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--def-mist)' }}>
                <Shield size={14} style={{ color: 'var(--def-copper)', flexShrink: 0 }} />
                <span>Property Maintenance & Security-Focused Specialist</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--def-mist)' }}>
                <Cpu size={14} style={{ color: 'var(--def-copper)', flexShrink: 0 }} />
                <span>AI Property 360™</span>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-[10px]" style={{ color: 'rgba(155,163,184,0.3)', fontFamily: 'var(--font-label)' }}>
                Cottage Country Property Maintenance & Security-Focused Specialists
              </div>
            </div>
          </div>
        </div>

        {/* Card back — services + QR placeholder */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(22,28,45,0.9) 0%, rgba(31,38,56,0.9) 100%)',
            border: '1px solid rgba(168,120,64,0.15)',
          }}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="text-[10px] font-bold mb-3" style={{ color: 'var(--def-copper)', fontFamily: 'var(--font-label)', letterSpacing: '0.08em' }}>
                AI PROPERTY 360™
              </div>
              <ul className="space-y-1.5 mb-4">
                {SERVICES.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-xs" style={{ color: 'var(--def-mist)' }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--def-copper)' }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* QR placeholder — points to /consultation */}
            <div className="flex-shrink-0 text-center">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center mb-1"
                style={{ background: 'white', border: '2px solid rgba(168,120,64,0.3)' }}
              >
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-0.5 p-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-[2px]"
                        style={{ background: [0,2,6,8].includes(i) ? '#161C2D' : [1,3,5,7].includes(i) ? 'transparent' : 'rgba(168,120,64,0.5)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-[9px]" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>Scan to consult</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          <Link href="/consultation" className="btn-primary w-full justify-center gap-2">
            <Calendar size={16} />
            Start Consultation
          </Link>
          <Link href="/def-ai" className="btn-ghost w-full justify-center gap-2">
            <MessageSquare size={16} />
            Ask DEF AI
          </Link>
          <Link href="/property-360" className="btn-ghost w-full justify-center gap-2">
            <Cpu size={16} />
            AI Property 360™
          </Link>
          <a
            href={vcardDataUri}
            download="Dylan-Francisco-DEF.vcf"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-75"
            style={{
              background: 'rgba(168,120,64,0.08)',
              border: '1px solid rgba(168,120,64,0.2)',
              color: 'var(--def-copper)',
              fontFamily: 'var(--font-label)',
            }}
          >
            <Download size={15} />
            Save Contact (.vcf)
          </a>
        </div>

        <p className="text-center text-[10px] mt-6" style={{ color: 'rgba(155,163,184,0.3)', fontFamily: 'var(--font-label)' }}>
          A Francisco Holdings Inc. Production — Empire Tower — Floor 17
        </p>
      </div>
    </div>
  );
}
