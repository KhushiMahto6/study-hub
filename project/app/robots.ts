import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/auth/', '/admin/', '/dashboard'] },
    sitemap: 'https://studyhub.app/sitemap.xml',
  };
}
