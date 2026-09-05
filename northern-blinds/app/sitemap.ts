import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://northernblinds.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/products', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/products/blinds-shades', priority: 0.85, changeFrequency: 'monthly' as const },
    { url: '/products/windows', priority: 0.85, changeFrequency: 'monthly' as const },
    { url: '/products/doors', priority: 0.85, changeFrequency: 'monthly' as const },
    { url: '/residential', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/commercial', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/cottage', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/about', priority: 0.75, changeFrequency: 'monthly' as const },
    { url: '/northern-ai', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/consultation', priority: 0.9, changeFrequency: 'monthly' as const },
  ];

  return routes.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
