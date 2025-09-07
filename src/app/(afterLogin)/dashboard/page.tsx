import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
  // 임시로 인증 체크 비활성화
  // const session = await getServerSession(authOptions);
  //
  // if (!session) {
  //   redirect("/login");
  // }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">안녕하세요, 선생님!</h1>
        <p className="text-gray-600 mt-2">
          오늘의 학습 활동을 확인하고 학생들의 성과를 관리해보세요.
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}
