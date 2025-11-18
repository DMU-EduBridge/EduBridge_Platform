import { Features } from '@/components/landing/features';
import { Hero } from '@/components/landing/hero';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'EduBridge AI Platform - AI 기반 교육 플랫폼',
  description: 'AI 기술을 활용한 통합 교육 플랫폼으로 교사와 학생을 연결하는 차세대 교육 솔루션',
  keywords: ['교육', 'AI', '학습', '플랫폼', 'EduBridge'],
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

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    // 역할에 따라 기본 랜딩 경로 분기
    if (session.user.role === 'STUDENT') {
      redirect('/my/learning');
    }
    if (session.user.role === 'ADMIN') {
      redirect('/admin');
    }
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
