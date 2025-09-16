import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authOptions } from '@/lib/core/auth';
import { Bell, Database, Globe, Settings, Shield } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">시스템 설정</h1>
        <p className="mt-2 text-gray-600">시스템 전반의 설정을 관리하고 보안 정책을 구성하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 일반 설정 */}
        <Card className="p-6">
          <div className="mb-4 flex items-center">
            <Settings className="mr-2 h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">일반 설정</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteName">사이트 이름</Label>
              <Input id="siteName" defaultValue="EduBridge" />
            </div>
            <div>
              <Label htmlFor="siteDescription">사이트 설명</Label>
              <Input id="siteDescription" defaultValue="AI 기반 교육 플랫폼" />
            </div>
            <div>
              <Label htmlFor="maxUsers">최대 사용자 수</Label>
              <Input id="maxUsers" type="number" defaultValue="1000" />
            </div>
            <div>
              <Label htmlFor="maintenanceMode">유지보수 모드</Label>
              <div className="mt-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">유지보수 모드 활성화</span>
                </label>
              </div>
            </div>
            <Button className="w-full">설정 저장</Button>
          </div>
        </Card>

        {/* 보안 설정 */}
        <Card className="p-6">
          <div className="mb-4 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">보안 설정</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
              <Input id="sessionTimeout" type="number" defaultValue="30" />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">최대 로그인 시도</Label>
              <Input id="maxLoginAttempts" type="number" defaultValue="5" />
            </div>
            <div>
              <Label htmlFor="passwordMinLength">최소 비밀번호 길이</Label>
              <Input id="passwordMinLength" type="number" defaultValue="8" />
            </div>
            <div>
              <Label htmlFor="twoFactorAuth">2단계 인증</Label>
              <div className="mt-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">2단계 인증 필수</span>
                </label>
              </div>
            </div>
            <Button className="w-full">보안 설정 저장</Button>
          </div>
        </Card>

        {/* 데이터베이스 설정 */}
        <Card className="p-6">
          <div className="mb-4 flex items-center">
            <Database className="mr-2 h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">데이터베이스 관리</h3>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900">백업 상태</h4>
              <p className="text-sm text-gray-600">마지막 백업: 2024-01-20 02:00</p>
              <p className="text-sm text-gray-600">백업 크기: 45.2 MB</p>
            </div>
            <div className="space-y-2">
              <Button className="w-full">수동 백업 실행</Button>
              <Button variant="outline" className="w-full">
                백업 복원
              </Button>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <h4 className="font-medium text-red-900">위험 작업</h4>
              <p className="text-sm text-red-700">다음 작업은 되돌릴 수 없습니다.</p>
              <Button variant="destructive" className="mt-2 w-full">
                데이터베이스 초기화
              </Button>
            </div>
          </div>
        </Card>

        {/* 알림 설정 */}
        <Card className="p-6">
          <div className="mb-4 flex items-center">
            <Bell className="mr-2 h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">알림 설정</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">새 사용자 가입 알림</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">시스템 오류 알림</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">백업 완료 알림</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">보안 이벤트 알림</span>
              </label>
            </div>
            <div>
              <Label htmlFor="adminEmail">관리자 이메일</Label>
              <Input id="adminEmail" type="email" defaultValue="admin@edubridge.com" />
            </div>
            <Button className="w-full">알림 설정 저장</Button>
          </div>
        </Card>
      </div>

      {/* 시스템 정보 */}
      <Card className="p-6">
        <div className="mb-4 flex items-center">
          <Globe className="mr-2 h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">시스템 정보</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900">서버 상태</h4>
            <p className="text-sm text-green-600">정상 운영</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900">메모리 사용량</h4>
            <p className="text-sm text-gray-600">2.1GB / 8GB</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900">디스크 사용량</h4>
            <p className="text-sm text-gray-600">45.2GB / 100GB</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

