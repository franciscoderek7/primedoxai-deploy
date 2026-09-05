import type { Metadata } from 'next';

const BASE_URL = process.env.DEF_PUBLIC_URL ?? 'https://defpropertymaintenance.ca';
const SITE_NAME = 'DEF Property Maintenance';

export function buildMetadata({
  title,
  description,
  path = '',
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${BASE_URL}${path}`;
  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
