import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { MyReportsClient } from './my-reports-client';

export default async function MyReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  return <MyReportsClient session={session} />;
}
