import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20" style={{ background: 'var(--surface-page)' }}>
      <div className="text-center px-6">
        <div
          className="inline-block text-7xl font-display mb-4"
          style={{ color: 'var(--def-copper)', letterSpacing: '-0.05em' }}
        >
          404
        </div>
        <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--def-night)', letterSpacing: '-0.02em' }}>
          Page not found
        </h1>
        <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: 'var(--def-stone)' }}>
          The page you&apos;re looking for doesn&apos;t exist, or may have moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Back to home</Link>
          <Link href="/services" className="btn-ghost">View services</Link>
        </div>
      </div>
    </div>
  );
}
