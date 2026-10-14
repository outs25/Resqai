import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/report', '/track'],
        disallow: ['/api/', '/operator/'],
      },
    ],
    sitemap: 'https://resqai.org/sitemap.xml',
  };
}
