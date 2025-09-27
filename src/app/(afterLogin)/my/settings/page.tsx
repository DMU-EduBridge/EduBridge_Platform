import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authOptions } from '@/lib/core/auth';
import { Bell, BookOpen, Palette, Settings, Shield, User } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function StudentSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
        <p className="mt-2 text-gray-600">학습 환경과 계정 정보를 관리하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 프로필 설정 */}
        <Card className="p-6">
          <div className="mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">프로필 정보</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input id="name" defaultValue={session.user.name || ''} />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" defaultValue={session.user.email || ''} />
            </div>
            <div>
              <Label htmlFor="grade">학년</Label>
              <select id="grade" className="w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="">학년 선택</option>
                <option value="1학년">1학년</option>
                <option value="2학년">2학년</option>
                <option value="3학년">3학년</option>
                <option value="4학년">4학년</option>
                <option value="5학년">5학년</option>
                <option value="6학년">6학년</option>
              </select>
            </div>
            <div>
              <Label htmlFor="bio">자기소개</Label>
              <textarea
                id="bio"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="자기소개를 입력하세요..."
              />
            </div>
            <div>
              <Label htmlFor="avatar">프로필 이미지</Label>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300">
                  <span className="text-lg font-medium text-gray-700">
                    {session.user.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <Button variant="outline">이미지 변경</Button>
              </div>
            </div>
            <Button className="w-full">프로필 저장</Button>
          </div>
        </Card>

        {/* 학습 설정 */}
        <Card className="p-6">
          <div className="mb-4 flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">학습 설정</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preferredDifficulty">선호 난이도</Label>
              <select
                id="preferredDifficulty"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="EASY">쉬움</option>
                <option value="MEDIUM" selected>
                  보통
                </option>
                <option value="HARD">어려움</option>
                <option value="EXPERT">전문가</option>
              </select>
            </div>
            <div>
              <Label htmlFor="learningStyle">학습 스타일</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">시각적 학습</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">청각적 학습</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">체험적 학습</span>
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="studyTime">일일 학습 목표 시간 (분)</Label>
              <Input id="studyTime" type="number" defaultValue="60" />
            </div>
            <div>
              <Label htmlFor="interests">관심 과목</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">수학</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">과학</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">국어</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">영어</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">사회</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">역사</span>
                </label>
              </div>
            </div>
            <Button className="w-full">학습 설정 저장</Button>
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
                <span className="text-sm text-gray-700">이메일 알림</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">학습 목표 달성 알림</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">새로운 문제 알림</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">주간 리포트 알림</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">학습 권장사항 알림</span>
              </label>
            </div>
            <div>
              <Label htmlFor="notificationEmail">알림 이메일</Label>
              <Input id="notificationEmail" type="email" defaultValue={session.user.email || ''} />
            </div>
            <Button className="w-full">알림 설정 저장</Button>
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
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div>
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">로그인 알림</span>
              </label>
            </div>
            <Button className="w-full">비밀번호 변경</Button>
          </div>
        </Card>

        {/* 테마 설정 */}
        <Card className="p-6">
          <div className="mb-4 flex items-center">
            <Palette className="mr-2 h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">테마 설정</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">테마</Label>
              <select id="theme" className="w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="light">라이트 모드</option>
                <option value="dark">다크 모드</option>
                <option value="auto">시스템 설정</option>
              </select>
            </div>
            <div>
              <Label htmlFor="language">언어</Label>
              <select id="language" className="w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">애니메이션 효과</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">학습 진도 애니메이션</span>
              </label>
            </div>
            <Button className="w-full">테마 설정 저장</Button>
          </div>
        </Card>
      </div>

      {/* 계정 관리 */}
      <Card className="p-6">
        <div className="mb-4 flex items-center">
          <Settings className="mr-2 h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">계정 관리</h3>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="font-medium text-blue-900">학습 데이터 내보내기</h4>
            <p className="text-sm text-blue-700">나의 학습 기록과 성과를 다운로드할 수 있습니다.</p>
            <Button variant="outline" className="mt-2">
              학습 데이터 내보내기
            </Button>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <h4 className="font-medium text-yellow-900">학습 기록 초기화</h4>
            <p className="text-sm text-yellow-700">
              모든 학습 기록을 초기화하고 처음부터 시작할 수 있습니다.
            </p>
            <Button variant="outline" className="mt-2">
              학습 기록 초기화
            </Button>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <h4 className="font-medium text-red-900">계정 삭제</h4>
            <p className="text-sm text-red-700">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <Button variant="destructive" className="mt-2">
              계정 삭제
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}











