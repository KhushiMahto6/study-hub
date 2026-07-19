import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://studyhub.app';
  const routes = ['', '/resources', '/boards', '/bulletin', '/placements', '/auth/sign-in', '/auth/sign-up'];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: r === '' ? 1 : 0.8,
  }));
}
