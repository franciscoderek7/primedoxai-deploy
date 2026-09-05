import type { Metadata } from 'next';

export function buildMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const baseTitle = 'Northern Blinds — Custom Blinds, Windows & Doors | Northern Ontario';
  const baseDesc =
    'Custom blinds, shades, windows, and doors for Northern Ontario homes, cottages, and businesses. Free in-home measurement and expert installation. Serving Kawarthas, Muskoka, and Peterborough.';

  return {
    title: overrides.title ?? baseTitle,
    description: overrides.description ?? baseDesc,
    openGraph: {
      type: 'website',
      locale: 'en_CA',
      siteName: 'Northern Blinds',
      title: (overrides.title as string) ?? baseTitle,
      description: overrides.description ?? baseDesc,
      ...(overrides.openGraph ?? {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: (overrides.title as string) ?? baseTitle,
      description: overrides.description ?? baseDesc,
      ...(overrides.twitter ?? {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    ...overrides,
  };
}
