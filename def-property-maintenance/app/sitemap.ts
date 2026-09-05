import type { MetadataRoute } from 'next';

const BASE_URL = process.env.DEF_PUBLIC_URL ?? 'https://defpropertymaintenance.ca';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/services/property-maintenance', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/cottage-care', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/inspections', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/locksmith', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/security', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/property-360', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/consultation', priority: 0.95, changeFrequency: 'monthly' as const },
    { url: '/def-ai', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/card', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  return pages.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
