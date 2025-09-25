import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://edubridge.com'; // 실제 도메인으로 변경

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/features',
          '/how-it-works',
          '/pricing',
          '/contact',
          '/help',
          '/privacy',
          '/terms',
          '/login',
          '/signup',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/my/',
          '/admin/',
          '/problems/*/manage',
          '/reports/',
          '/settings/',
          '/profile/',
          '/_next/',
          '/node_modules/',
        ],
      },
      // 검색엔진별 특별 규칙
      {
        userAgent: 'Googlebot',
        allow: ['/', '/about', '/features', '/how-it-works', '/pricing', '/contact', '/help'],
        disallow: ['/api/', '/dashboard/', '/my/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
