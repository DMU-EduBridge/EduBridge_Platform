import { DashboardLayout } from '@/components/dashboard/layout';

export default function AfterLoginLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
