'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1 — Project type
  projectType: string;
  propertyType: string;
  // Step 2 — What they need
  products: string[];
  roomsCount: string;
  // Step 3 — Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  // Step 4 — Timing & notes
  timeline: string;
  notes: string;
}

const INITIAL: FormData = {
  projectType: '',
  propertyType: '',
  products: [],
  roomsCount: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  timeline: '',
  notes: '',
};

const PROJECT_TYPES = [
  { value: 'new', label: 'New Installation', desc: 'First time fitting out windows/doors' },
  { value: 'replace', label: 'Replacement', desc: 'Replacing existing blinds or windows' },
  { value: 'reno', label: 'Renovation', desc: 'Part of a larger renovation' },
  { value: 'commercial', label: 'Commercial', desc: 'Office, retail, or other business space' },
];

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo / Apartment' },
  { value: 'cottage', label: 'Cottage / Seasonal' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'new_build', label: 'New Build' },
];

const PRODUCT_OPTIONS = [
  { value: 'blinds', label: 'Blinds & Shades' },
  { value: 'windows', label: 'Windows' },
  { value: 'doors', label: 'Doors' },
  { value: 'motorized', label: 'Motorized / Smart' },
];

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1_month', label: 'Within a month' },
  { value: '3_months', label: '1–3 months' },
  { value: 'flexible', label: 'Just exploring' },
];

export default function ConsultationForm() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleProduct = (val: string) => {
    setForm((f) => ({
      ...f,
      products: f.products.includes(val)
        ? f.products.filter((p) => p !== val)
        : [...f.products, val],
    }));
  };

  const canAdvance = () => {
    if (step === 1) return !!form.projectType && !!form.propertyType;
    if (step === 2) return form.products.length > 0;
    if (step === 3)
      return (
        !!form.firstName.trim() &&
        !!form.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
        !!form.city.trim()
      );
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed. Please try again.');
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(77,124,94,0.12)' }}
        >
          <CheckCircle size={32} style={{ color: 'var(--nb-sage)' }} />
        </div>
        <h2
          className="font-display mb-3"
          style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}
        >
          You&apos;re all set, {form.firstName}!
        </h2>
        <p className="text-base max-w-sm mx-auto" style={{ color: 'var(--nb-stone)' }}>
          We&apos;ve received your consultation request and will be in touch within one business day to confirm your appointment.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          {['Project', 'Products', 'Contact', 'Timing'].map((label, i) => (
            <div
              key={label}
              className="flex items-center gap-2 text-xs font-semibold"
              style={{
                fontFamily: 'var(--font-label)',
                color: step > i + 1
                  ? 'var(--nb-sage)'
                  : step === i + 1
                  ? 'var(--nb-gold)'
                  : 'var(--nb-mist)',
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                style={{
                  background:
                    step > i + 1
                      ? 'var(--nb-sage)'
                      : step === i + 1
                      ? 'var(--nb-gold)'
                      : 'var(--border-light)',
                  color: step > i + 1 || step === i + 1 ? 'white' : 'var(--nb-mist)',
                }}
              >
                {step > i + 1 ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block">{label}</span>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {/* Step 1 — Project */}
      {step === 1 && (
        <div>
          <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--nb-night)' }}>
            What kind of project is this?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--nb-stone)' }}>
            This helps us send the right person to your home.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {PROJECT_TYPES.map((p) => (
              <button
                key={p.value}
                onClick={() => setForm((f) => ({ ...f, projectType: p.value }))}
                className={`option-card ${form.projectType === p.value ? 'selected' : ''}`}
              >
                <span className="font-semibold text-sm" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
                  {p.label}
                </span>
                <span className="text-xs" style={{ color: 'var(--nb-stone)' }}>
                  {p.desc}
                </span>
              </button>
            ))}
          </div>

          <h3 className="font-display text-xl mb-4" style={{ color: 'var(--nb-night)' }}>
            Property type
          </h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {PROPERTY_TYPES.map((p) => (
              <button
                key={p.value}
                onClick={() => setForm((f) => ({ ...f, propertyType: p.value }))}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  form.propertyType === p.value
                    ? 'border-[var(--nb-gold)] bg-[rgba(201,160,85,0.08)] text-[var(--nb-night)]'
                    : 'border-[var(--border-light)] bg-white text-[var(--nb-stone)] hover:border-[var(--nb-gold)]'
                }`}
                style={{ fontFamily: 'var(--font-label)' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Products */}
      {step === 2 && (
        <div>
          <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--nb-night)' }}>
            What are you looking for?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--nb-stone)' }}>
            Select all that apply. We handle it all in one visit.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {PRODUCT_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => toggleProduct(p.value)}
                className={`option-card ${form.products.includes(p.value) ? 'selected' : ''}`}
              >
                <span className="font-semibold text-sm" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
              Approximately how many windows / rooms? (optional)
            </label>
            <input
              type="text"
              className="input-nb"
              placeholder="e.g. 6 windows in 3 rooms"
              value={form.roomsCount}
              onChange={(e) => setForm((f) => ({ ...f, roomsCount: e.target.value }))}
              maxLength={100}
            />
          </div>
        </div>
      )}

      {/* Step 3 — Contact */}
      {step === 3 && (
        <div>
          <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--nb-night)' }}>
            How do we reach you?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--nb-stone)' }}>
            We&apos;ll confirm your appointment within one business day.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
                First Name *
              </label>
              <input
                type="text"
                className="input-nb"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                maxLength={80}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
                Last Name
              </label>
              <input
                type="text"
                className="input-nb"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                maxLength={80}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
              Email *
            </label>
            <input
              type="email"
              className="input-nb"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              maxLength={200}
              autoComplete="email"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
                Phone (optional)
              </label>
              <input
                type="tel"
                className="input-nb"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                maxLength={20}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
                City / Town *
              </label>
              <input
                type="text"
                className="input-nb"
                placeholder="e.g. Peterborough"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                maxLength={100}
                autoComplete="address-level2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Timing */}
      {step === 4 && (
        <div>
          <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--nb-night)' }}>
            When are you thinking?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--nb-stone)' }}>
            Almost done. No pressure — even &quot;just exploring&quot; is fine.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {TIMELINE_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm((f) => ({ ...f, timeline: t.value }))}
                className={`option-card ${form.timeline === t.value ? 'selected' : ''}`}
              >
                <span className="font-semibold text-sm" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--nb-night)', fontFamily: 'var(--font-label)' }}>
              Anything else we should know? (optional)
            </label>
            <textarea
              className="input-nb resize-none"
              style={{ minHeight: '100px' }}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              maxLength={1000}
              placeholder="Specific window sizes, accessibility needs, style preferences, etc."
            />
          </div>

          {submitError && (
            <p className="mt-4 text-sm" style={{ color: '#e87a7a' }}>
              {submitError}
            </p>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-10">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--nb-stone)', fontFamily: 'var(--font-label)' }}
          >
            <ChevronLeft size={16} />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={() => canAdvance() && setStep((s) => (s + 1) as Step)}
            disabled={!canAdvance()}
            className="btn-primary gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Request Consultation
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
