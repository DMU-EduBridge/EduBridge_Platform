import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://edubridge.com'; // 실제 도메인으로 변경

  // 정적 페이지들
  const staticPages = [
    '',
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
  ];

  // 정적 페이지 사이트맵 항목 생성
  const staticSitemap: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' : 'weekly',
    priority: page === '' ? 1.0 : 0.8,
  }));

  // 동적 페이지들 (예시 - 실제로는 데이터베이스에서 가져와야 함)
  const dynamicSitemap: MetadataRoute.Sitemap = [
    // 문제 페이지들
    {
      url: `${baseUrl}/problems`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // 학습 자료 페이지들
    {
      url: `${baseUrl}/learning-materials`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // 대시보드 (로그인 필요)
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  return [...staticSitemap, ...dynamicSitemap];
}
