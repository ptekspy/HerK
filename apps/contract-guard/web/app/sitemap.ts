import type { MetadataRoute } from 'next';

import { getSiteOrigin } from './content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const now = new Date();
  const paths = [
    '/',
    '/about',
    '/pricing',
    '/features',
    '/privacy-policy',
    '/terms-of-use',
    '/cookie-policy',
    '/help',
    '/onboarding',
    '/app',
  ];

  return paths.map((path) => ({
    url: `${origin}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
