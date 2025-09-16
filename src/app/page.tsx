import { CTA } from '@/components/landing/cta';
import { Features } from '@/components/landing/features';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Stats } from '@/components/landing/stats';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    // 역할에 따라 기본 랜딩 경로 분기
    if (session.user.role === 'STUDENT') {
      redirect('/problems');
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
        <HowItWorks />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
