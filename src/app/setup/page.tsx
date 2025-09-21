'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, GraduationCap, LogOut, Users } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RoleSetupPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [additionalInfo, setAdditionalInfo] = useState({
    school: '',
    grade: '',
    subject: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoBack = () => {
    // 이전 페이지로 돌아가기
    router.back();
  };

  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      try {
        // authService.logout() 호출
        const { authService } = await import('@/services/auth');
        await authService.logout();

        // NextAuth signOut으로 리다이렉트
        await signOut({
          callbackUrl: '/login',
          redirect: true,
        });
      } catch (error) {
        console.error('Logout error:', error);
        // 오류가 발생해도 로그인 페이지로 이동
        window.location.href = '/login';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 사용자 정보를 서버에 저장
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          ...additionalInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Setup - API response:', data);

        // 세션 새로고침
        await update();

        // Setup 완료 후 즉시 목적지로 이동
        console.log('Setup - Completing setup, redirecting immediately');

        // API에서 제공하는 redirectTo 사용
        const redirectUrl = data.redirectTo || (role === 'STUDENT' ? '/problems' : '/dashboard');
        console.log('Setup - Redirecting to:', redirectUrl);

        // 잠시 대기 후 이동 (세션 업데이트 완료 보장)
        setTimeout(() => {
          console.log('Setup - Executing redirect to:', redirectUrl);
          // 강제로 페이지 새로고침 후 리다이렉트
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error('Setup - API error:', errorData);
        setError(errorData.error || '설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Role setup error:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              뒤로
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold">환영합니다!</CardTitle>
          <CardDescription>
            {session?.user?.name && (
              <span className="mb-2 block text-sm text-gray-600">
                안녕하세요, {session.user.name}님!
              </span>
            )}
            계정 설정을 완료하여 서비스를 이용하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 역할 선택 */}
            <div className="space-y-3">
              <Label className="text-base font-medium">역할을 선택해주세요</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as 'STUDENT' | 'TEACHER')}
              >
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="STUDENT" id="student" />
                  <Label
                    htmlFor="student"
                    className="flex flex-1 cursor-pointer items-center space-x-2"
                  >
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">학생</div>
                      <div className="text-sm text-gray-500">
                        문제를 풀고 학습 진도를 확인합니다
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="TEACHER" id="teacher" />
                  <Label
                    htmlFor="teacher"
                    className="flex flex-1 cursor-pointer items-center space-x-2"
                  >
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">선생님</div>
                      <div className="text-sm text-gray-500">
                        학생을 관리하고 학습 자료를 제공합니다
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 추가 정보 입력 */}
            <div className="space-y-4">
              {role === 'STUDENT' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="school">학교명</Label>
                    <Input
                      id="school"
                      placeholder="예: 서울고등학교"
                      value={additionalInfo.school}
                      onChange={(e) =>
                        setAdditionalInfo((prev) => ({ ...prev, school: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">학년</Label>
                    <Input
                      id="grade"
                      placeholder="예: 1학년"
                      value={additionalInfo.grade}
                      onChange={(e) =>
                        setAdditionalInfo((prev) => ({ ...prev, grade: e.target.value }))
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="subject">담당 과목</Label>
                  <Input
                    id="subject"
                    placeholder="예: 수학, 영어, 과학"
                    value={additionalInfo.subject}
                    onChange={(e) =>
                      setAdditionalInfo((prev) => ({ ...prev, subject: e.target.value }))
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleGoBack}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? '설정 중...' : '설정 완료'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
