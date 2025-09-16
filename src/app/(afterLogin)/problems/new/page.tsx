import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authOptions } from '@/lib/core/auth';
import { FileText, Save } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function NewProblemPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'STUDENT') {
    redirect('/problems');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">새 문제 생성</h1>
          <p className="mt-2 text-gray-600">학생들을 위한 새로운 문제를 생성하세요.</p>
        </div>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          문제 템플릿
        </Button>
      </div>

      <form className="space-y-6">
        {/* 기본 정보 */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">기본 정보</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">문제 제목</Label>
              <Input id="title" placeholder="문제 제목을 입력하세요" />
            </div>
            <div>
              <Label htmlFor="subject">과목</Label>
              <select id="subject" className="w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="">과목 선택</option>
                <option value="수학">수학</option>
                <option value="과학">과학</option>
                <option value="국어">국어</option>
                <option value="영어">영어</option>
                <option value="사회">사회</option>
                <option value="역사">역사</option>
              </select>
            </div>
            <div>
              <Label htmlFor="type">문제 유형</Label>
              <select id="type" className="w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="">유형 선택</option>
                <option value="MULTIPLE_CHOICE">객관식</option>
                <option value="SHORT_ANSWER">단답형</option>
                <option value="ESSAY">서술형</option>
                <option value="CODING">코딩</option>
                <option value="MATH">수학</option>
              </select>
            </div>
            <div>
              <Label htmlFor="difficulty">난이도</Label>
              <select
                id="difficulty"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">난이도 선택</option>
                <option value="EASY">쉬움</option>
                <option value="MEDIUM">보통</option>
                <option value="HARD">어려움</option>
                <option value="EXPERT">전문가</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="description">문제 설명</Label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="문제에 대한 간단한 설명을 입력하세요"
            />
          </div>
        </Card>

        {/* 문제 내용 */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">문제 내용</h3>
          <div>
            <Label htmlFor="content">문제 본문</Label>
            <textarea
              id="content"
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="문제의 본문을 입력하세요..."
            />
          </div>
        </Card>

        {/* 객관식 선택지 */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">객관식 선택지</h3>
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <span className="w-6 text-sm font-medium text-gray-700">{option}.</span>
                <Input placeholder={`선택지 ${option}`} />
                <label className="flex items-center">
                  <input type="radio" name="correct" value={option} className="mr-2" />
                  <span className="text-sm text-gray-700">정답</span>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* 정답 및 해설 */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">정답 및 해설</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="correctAnswer">정답</Label>
              <Input id="correctAnswer" placeholder="정답을 입력하세요" />
            </div>
            <div>
              <Label htmlFor="explanation">해설</Label>
              <textarea
                id="explanation"
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="문제의 해설을 입력하세요..."
              />
            </div>
            <div>
              <Label htmlFor="hints">힌트 (선택사항)</Label>
              <textarea
                id="hints"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="힌트를 입력하세요 (여러 개일 경우 줄바꿈으로 구분)"
              />
            </div>
          </div>
        </Card>

        {/* 태그 및 메타데이터 */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">태그 및 메타데이터</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="tags">태그</Label>
              <Input id="tags" placeholder="태그를 쉼표로 구분하여 입력하세요" />
            </div>
            <div>
              <Label htmlFor="timeLimit">제한 시간 (초)</Label>
              <Input id="timeLimit" type="number" placeholder="300" />
            </div>
            <div>
              <Label htmlFor="points">점수</Label>
              <Input id="points" type="number" defaultValue="1" />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">문제 활성화</span>
              </label>
            </div>
          </div>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline">미리보기</Button>
          <Button variant="outline">임시 저장</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            문제 생성
          </Button>
        </div>
      </form>
    </div>
  );
}

