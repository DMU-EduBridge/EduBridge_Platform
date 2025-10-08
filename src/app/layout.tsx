import { WebVitalsReporter } from '@/components/analytics/web-vitals-reporter';
import { PerformanceProvider } from '@/lib/performance-provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'EduBridge AI Platform',
  description: 'AI 기반 교육 플랫폼으로 선생님과 학생을 연결하는 통합 교육 솔루션',
  keywords: ['교육', 'AI', '플랫폼', '선생님', '학생', '문제', '학습'],
  authors: [{ name: 'EduBridge Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'EduBridge AI Platform',
    description: 'AI 기반 교육 플랫폼으로 선생님과 학생을 연결하는 통합 교육 솔루션',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduBridge AI Platform',
    description: 'AI 기반 교육 플랫폼으로 선생님과 학생을 연결하는 통합 교육 솔루션',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 성능 최적화를 위한 리소스 프리로딩 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.edubridge.com" />

        {/* 메타 태그 최적화 */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className}>
        <PerformanceProvider>
          <Providers>
            <WebVitalsReporter />
            {children}
          </Providers>
        </PerformanceProvider>
      </body>
    </html>
  );
}
