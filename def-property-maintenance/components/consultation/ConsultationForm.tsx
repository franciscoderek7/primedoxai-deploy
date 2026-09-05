'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, MapPin, Wrench, Home, Search, Lock, Eye, Cpu, Upload, Calendar } from 'lucide-react';
import Link from 'next/link';

type FormData = {
  // Property
  propertyType: string;
  // Location
  propertyCity: string;
  propertyRegion: string;
  // Services
  services: string[];
  // Security/needs
  securityNeeds: string[];
  notes: string;
  // Timeline
  timeline: string;
  // Customer
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Consent
  consent: boolean;
};

const PROPERTY_TYPES = [
  { value: 'residential', label: 'Residential Home' },
  { value: 'cottage', label: 'Cottage / Seasonal' },
  { value: 'commercial', label: 'Commercial Property' },
  { value: 'vacant', label: 'Vacant / Investment' },
  { value: 'rental', label: 'Rental Property' },
];

const REGIONS = [
  'Kawarthas', 'Muskoka', 'Peterborough', 'Lindsay', 'Haliburton',
  'Bobcaygeon', 'Fenelon Falls', 'Minden', 'Bracebridge', 'Huntsville',
  'Gravenhurst', 'Bancroft', 'Other / Not Listed',
];

const SERVICE_OPTIONS = [
  { value: 'property-maintenance', label: 'Property Maintenance', icon: Wrench },
  { value: 'cottage-care', label: 'Cottage Care', icon: Home },
  { value: 'inspections', label: 'Property Inspections', icon: Search },
  { value: 'locksmith', label: 'Locksmith Services', icon: Lock },
  { value: 'security', label: 'Security-Focused Services', icon: Eye },
  { value: 'ai-property-360', label: 'AI Property 360™', icon: Cpu },
];

const SECURITY_NEEDS = [
  'Lock upgrades / re-keying',
  'Smart lock installation',
  'Security vulnerability walkthrough',
  'Camera placement consultation',
  'Access control setup',
  'AI monitoring setup',
  'Key holder management',
  'Not sure — looking for assessment',
];

const TIMELINES = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '2weeks', label: 'Within 2 weeks' },
  { value: '1month', label: 'Within 1 month' },
  { value: 'seasonal', label: 'Seasonal (spring/fall)' },
  { value: 'planning', label: 'Planning ahead — no rush' },
];

const STEPS = ['Property', 'Location', 'Services', 'Needs', 'Timeline', 'You', 'Review'];

const EMPTY: FormData = {
  propertyType: '', propertyCity: '', propertyRegion: '', services: [],
  securityNeeds: [], notes: '', timeline: '', firstName: '', lastName: '',
  email: '', phone: '', consent: false,
};

export default function ConsultationForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof FormData, v: FormData[keyof FormData]) =>
    setData((prev) => ({ ...prev, [k]: v }));

  const toggleArray = (k: 'services' | 'securityNeeds', val: string) => {
    setData((prev) => {
      const arr = prev[k] as string[];
      return { ...prev, [k]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };

  const canAdvance = () => {
    if (step === 0) return !!data.propertyType;
    if (step === 1) return !!data.propertyCity && !!data.propertyRegion;
    if (step === 2) return data.services.length > 0;
    if (step === 3) return true;
    if (step === 4) return !!data.timeline;
    if (step === 5) return !!data.firstName && !!data.email && data.consent;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? 'Submission failed');
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(168,120,64,0.1)' }}
        >
          <CheckCircle size={32} style={{ color: 'var(--def-copper)' }} />
        </div>
        <h2 className="font-display text-2xl mb-3" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>
          Consultation Request Received
        </h2>
        <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'var(--def-stone)', lineHeight: '1.65' }}>
          Dylan will review your property details and follow up shortly to confirm scope and scheduling.
          You&apos;ll hear back at the email you provided.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/property-360" className="btn-primary">
            Explore AI Property 360™
          </Link>
          <Link href="/def-ai" className="btn-ghost">
            Ask DEF AI a question
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
          <span>Step {step + 1} of {STEPS.length} — {STEPS[step]}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(168,120,64,0.12)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'var(--def-copper)' }}
          />
        </div>
      </div>

      {/* Step 0: Property type */}
      {step === 0 && (
        <div>
          <h2 className="font-display text-xl mb-1" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>About your property</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--def-stone)' }}>What type of property needs service?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROPERTY_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => set('propertyType', value)}
                className="text-left px-4 py-4 rounded-xl border text-sm font-medium transition-all"
                style={{
                  borderColor: data.propertyType === value ? 'var(--def-copper)' : 'var(--border-light)',
                  background: data.propertyType === value ? 'rgba(168,120,64,0.06)' : 'white',
                  color: data.propertyType === value ? 'var(--def-copper)' : 'var(--def-night)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div>
          <h2 className="font-display text-xl mb-1" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>Property location</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--def-stone)' }}>Where is the property located?</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
                City / Township / Lake Name
              </label>
              <input
                type="text"
                value={data.propertyCity}
                onChange={(e) => set('propertyCity', e.target.value)}
                placeholder="e.g. Bobcaygeon, Lake Simcoe, Huntsville"
                className="input-def w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
                Region
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => set('propertyRegion', r)}
                    className="text-xs px-3 py-2.5 rounded-lg border text-left transition-all"
                    style={{
                      borderColor: data.propertyRegion === r ? 'var(--def-copper)' : 'var(--border-light)',
                      background: data.propertyRegion === r ? 'rgba(168,120,64,0.06)' : 'white',
                      color: data.propertyRegion === r ? 'var(--def-copper)' : 'var(--def-stone)',
                    }}
                  >
                    <MapPin size={10} className="inline mr-1" style={{ color: 'inherit', opacity: 0.7 }} />
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Services */}
      {step === 2 && (
        <div>
          <h2 className="font-display text-xl mb-1" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>Services needed</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--def-stone)' }}>Select all that apply. Not sure? Select your best guess — Dylan will clarify during consultation.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICE_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = data.services.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleArray('services', value)}
                  className="flex items-center gap-3 text-left px-4 py-4 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    borderColor: active ? 'var(--def-copper)' : 'var(--border-light)',
                    background: active ? 'rgba(168,120,64,0.06)' : 'white',
                    color: active ? 'var(--def-copper)' : 'var(--def-night)',
                  }}
                >
                  <Icon size={16} style={{ color: active ? 'var(--def-copper)' : 'var(--def-mist)', flexShrink: 0 }} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Security/needs */}
      {step === 3 && (
        <div>
          <h2 className="font-display text-xl mb-1" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>Specific needs</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--def-stone)' }}>Select any that apply, then add notes below. Skip if not applicable.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {SECURITY_NEEDS.map((need) => {
              const active = data.securityNeeds.includes(need);
              return (
                <button
                  key={need}
                  onClick={() => toggleArray('securityNeeds', need)}
                  className="text-left text-xs px-3 py-2.5 rounded-lg border transition-all"
                  style={{
                    borderColor: active ? 'var(--def-copper)' : 'var(--border-light)',
                    background: active ? 'rgba(168,120,64,0.06)' : 'white',
                    color: active ? 'var(--def-copper)' : 'var(--def-stone)',
                  }}
                >
                  {need}
                </button>
              );
            })}
          </div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
            Additional notes (optional)
          </label>
          <textarea
            rows={4}
            value={data.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Describe your property situation, any urgent issues, access requirements, or anything else Dylan should know…"
            className="input-def w-full resize-none"
          />
        </div>
      )}

      {/* Step 4: Timeline */}
      {step === 4 && (
        <div>
          <h2 className="font-display text-xl mb-1" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>Timeline</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--def-stone)' }}>When do you need service?</p>
          <div className="space-y-3">
            {TIMELINES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => set('timeline', value)}
                className="w-full flex items-center gap-3 text-left px-4 py-4 rounded-xl border text-sm font-medium transition-all"
                style={{
                  borderColor: data.timeline === value ? 'var(--def-copper)' : 'var(--border-light)',
                  background: data.timeline === value ? 'rgba(168,120,64,0.06)' : 'white',
                  color: data.timeline === value ? 'var(--def-copper)' : 'var(--def-night)',
                }}
              >
                <Calendar size={15} style={{ color: data.timeline === value ? 'var(--def-copper)' : 'var(--def-mist)', flexShrink: 0 }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Customer info */}
      {step === 5 && (
        <div>
          <h2 className="font-display text-xl mb-1" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>Your information</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--def-stone)' }}>Dylan will follow up at the contact information below.</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
                  First name *
                </label>
                <input
                  type="text"
                  value={data.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  className="input-def w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
                  Last name
                </label>
                <input
                  type="text"
                  value={data.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  className="input-def w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
                Email address *
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => set('email', e.target.value)}
                className="input-def w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>
                Phone number (optional)
              </label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="705-555-0000"
                className="input-def w-full"
              />
            </div>
            <div
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ borderColor: 'var(--border-light)', background: 'rgba(22,28,45,0.03)' }}
            >
              <input
                type="checkbox"
                id="consent"
                checked={data.consent}
                onChange={(e) => set('consent', e.target.checked)}
                className="mt-0.5"
                style={{ accentColor: 'var(--def-copper)' }}
              />
              <label htmlFor="consent" className="text-xs leading-relaxed" style={{ color: 'var(--def-stone)' }}>
                I agree to be contacted by DEF Property Maintenance regarding my consultation request.
                My information will be used only to respond to this request and will not be shared with third parties.
                I can withdraw consent at any time.{' '}
                <Link href="/privacy" className="underline" style={{ color: 'var(--def-copper)' }}>Privacy Policy</Link>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Review */}
      {step === 6 && (
        <div>
          <h2 className="font-display text-xl mb-1" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>Review your request</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--def-stone)' }}>Confirm your details before submitting.</p>
          <div className="space-y-3 mb-6">
            {[
              { label: 'Property type', value: PROPERTY_TYPES.find((p) => p.value === data.propertyType)?.label },
              { label: 'Location', value: data.propertyCity ? `${data.propertyCity}, ${data.propertyRegion}` : undefined },
              { label: 'Services', value: data.services.map((s) => SERVICE_OPTIONS.find((o) => o.value === s)?.label).filter(Boolean).join(', ') },
              { label: 'Timeline', value: TIMELINES.find((t) => t.value === data.timeline)?.label },
              { label: 'Name', value: `${data.firstName} ${data.lastName}`.trim() },
              { label: 'Email', value: data.email },
              { label: 'Phone', value: data.phone || 'Not provided' },
              { label: 'Notes', value: data.notes || 'None' },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex gap-4 text-sm">
                <span className="w-28 flex-shrink-0 font-semibold" style={{ color: 'var(--def-smoke)', fontFamily: 'var(--font-label)' }}>{label}</span>
                <span style={{ color: 'var(--def-night)' }}>{value}</span>
              </div>
            ) : null)}
          </div>

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg mb-4"
              style={{ background: 'rgba(196,75,59,0.08)', color: 'var(--def-alert)', border: '1px solid rgba(196,75,59,0.2)' }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full justify-center gap-2"
          >
            {submitting ? 'Submitting…' : 'Submit Consultation Request'}
            {!submitting && <ArrowRight size={15} />}
          </button>
          <p className="text-xs text-center mt-3" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}>
            No payment required. Dylan will contact you to confirm scope and scheduling.
          </p>
        </div>
      )}

      {/* Navigation */}
      {step < 6 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70 disabled:opacity-30"
            style={{ color: 'var(--def-stone)', fontFamily: 'var(--font-label)' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="btn-primary gap-2 disabled:opacity-40"
          >
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}
      {step === 6 && (
        <button
          onClick={() => setStep(5)}
          className="flex items-center gap-2 text-sm font-semibold mt-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--def-stone)', fontFamily: 'var(--font-label)' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}
    </div>
  );
}
