import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="mb-6 inline-flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EduBridge</span>
            </Link>

            <Badge className="mb-4" variant="secondary">
              비밀번호 재설정
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900">비밀번호를 잊으셨나요?</h1>
            <p className="mt-2 text-gray-600">
              가입하신 이메일 주소를 입력하시면
              <br />
              비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          {/* Reset Form */}
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 재설정</CardTitle>
              <CardDescription>
                이메일 주소를 입력하시면 재설정 링크를 보내드립니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button className="w-full" size="lg">
                재설정 링크 보내기
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="mb-1 font-semibold">재설정 링크를 받지 못하셨나요?</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• 스팸 폴더를 확인해보세요</li>
                    <li>• 이메일 주소가 정확한지 확인해보세요</li>
                    <li>• 몇 분 후 다시 시도해보세요</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
                <div className="text-sm text-orange-800">
                  <p className="mb-1 font-semibold">보안 안내</p>
                  <p className="text-orange-700">
                    비밀번호 재설정 링크는 24시간 동안만 유효합니다. 링크를 받은 후 가능한 한 빨리
                    비밀번호를 변경해주세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              여전히 문제가 있으신가요?{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-700">
                고객지원팀에 문의하기
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}




