import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center pt-20"
      style={{ background: 'var(--surface-page)' }}
    >
      <div className="text-center px-6">
        <div
          className="font-display text-8xl mb-6"
          style={{ color: 'var(--border-light)' }}
        >
          404
        </div>
        <h1
          className="font-display mb-4"
          style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: 'var(--nb-night)' }}
        >
          Page not found
        </h1>
        <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: 'var(--nb-stone)' }}>
          The page you&apos;re looking for doesn&apos;t exist. Try heading back home or booking a consultation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/consultation" className="btn-outline-dark">Book Consultation</Link>
        </div>
      </div>
    </div>
  );
}
