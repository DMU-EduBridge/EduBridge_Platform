import { DashboardLayout } from '@/components/dashboard/layout';
import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AfterLoginLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // session을 DashboardLayout에 전달
  return <DashboardLayout session={session}>{children}</DashboardLayout>;
}
