import type { Metadata } from 'next';
import Link from 'next/link';
import { Eye, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security-Focused Property Services — DEF Property Maintenance',
  description: 'Security-oriented property assessments, vulnerability walkthroughs, access control recommendations, and AI Property 360™ smart monitoring configuration for cottage country and residential properties.',
};

const DETAILS = [
  { category: 'Security Assessments', items: ['Property vulnerability walkthrough', 'Entry point evaluation', 'Perimeter security review', 'Lighting and visibility assessment', 'Written assessment report with recommendations'] },
  { category: 'Access Control', items: ['Access control system recommendations', 'Smart lock consultation and setup', 'Temporary access code management', 'Key holder management', 'Contractor access coordination'] },
  { category: 'Camera & Monitoring Consultation', items: ['Camera placement recommendations', 'Field of view planning', 'AI Property 360™ camera integration planning', 'Blind spot identification', 'Monitoring coverage documentation'] },
  { category: 'AI Property 360™ Setup', items: ['Monitoring platform onboarding', 'Sensor deployment planning', 'Alert configuration', 'Ongoing monitoring coordination', 'Regular property intelligence reports'] },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="container-def py-16">

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,120,64,0.1)' }}>
              <Eye size={20} style={{ color: 'var(--def-copper)' }} />
            </div>
            <div className="eyebrow">DEF Services</div>
          </div>
          <h1 className="font-display mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}>
            Security-Focused Services
          </h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--def-stone)', lineHeight: '1.65' }}>
            Security-oriented property assessments, vulnerability walkthroughs, camera and access
            control recommendations, and AI Property 360™ smart monitoring setup.
          </p>
        </div>

        <div
          className="text-sm px-5 py-4 rounded-xl border mb-10 max-w-2xl"
          style={{ background: 'rgba(168,120,64,0.05)', borderColor: 'rgba(168,120,64,0.2)', color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}
        >
          DEF provides security-focused property services — assessments, recommendations, and smart technology setup.
          DEF does not offer licensed alarm monitoring, police response, emergency dispatch, or licensed security guard services.
          For emergencies, call 911.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {DETAILS.map(({ category, items }) => (
            <div key={category} className="card-def p-6">
              <h2 className="font-display text-lg mb-4" style={{ color: 'var(--def-night)', letterSpacing: '-0.01em' }}>
                {category}
              </h2>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--def-stone)' }}>
                    <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--def-copper)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/consultation" className="btn-primary gap-2">
            Start Property Consultation <ArrowRight size={14} />
          </Link>
          <Link href="/property-360" className="btn-ghost gap-2">
            Explore AI Property 360™ <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
