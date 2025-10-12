'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ProblemCard } from './problem-card';
import { ProblemSelectionModal } from './problem-selection-modal';

interface LearningMaterial {
  id: string;
  title: string;
  description: string | null;
  content: string;
  subject: string;
  difficulty: string;
  estimatedTime: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Problem {
  id: string;
  title: string;
  content: string;
  type: string;
  difficulty: string;
  subject: string;
  points: number;
  isActive: boolean;
  createdAt: string;
}

interface LearningMaterialEditClientProps {
  materialId: string;
}

export function LearningMaterialEditClient({ materialId }: LearningMaterialEditClientProps) {
  const router = useRouter();
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

  // 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    subject: '',
    difficulty: '',
    estimatedTime: '',
  });

  // 학습자료 정보 로드
  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await fetch(`/api/learning-materials/${materialId}`);
        if (!response.ok) {
          throw new Error('학습자료를 불러올 수 없습니다.');
        }
        const data = await response.json();
        const materialData = data.data;

        setMaterial(materialData);
        setFormData({
          title: materialData.title || '',
          description: materialData.description || '',
          content: materialData.content || '',
          subject: materialData.subject || '',
          difficulty: materialData.difficulty || '',
          estimatedTime: materialData.estimatedTime?.toString() || '',
        });
      } catch (error) {
        console.error('학습자료 로드 실패:', error);
        toast.error('학습자료를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId]);

  // 연결된 문제들 로드
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch(`/api/learning-materials/${materialId}/problems`);
        if (!response.ok) {
          throw new Error('문제 목록을 불러올 수 없습니다.');
        }
        const data = await response.json();
        setProblems(data.data.problems);
      } catch (error) {
        console.error('문제 목록 로드 실패:', error);
        toast.error('문제 목록을 불러오는데 실패했습니다.');
      }
    };

    if (materialId) {
      fetchProblems();
    }
  }, [materialId]);

  // 학습자료 저장
  const handleSave = async () => {
    if (!material) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/learning-materials/${materialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          subject: formData.subject,
          difficulty: formData.difficulty,
          estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('저장에 실패했습니다.');
      }

      toast.success('학습자료가 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 문제 추가
  const handleAddProblem = async (problemId: string) => {
    try {
      const response = await fetch(`/api/learning-materials/${materialId}/problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problemId }),
      });

      if (!response.ok) {
        throw new Error('문제 추가에 실패했습니다.');
      }

      const data = await response.json();
      setProblems([...problems, data.data.problem]);
      toast.success('문제가 추가되었습니다.');
    } catch (error) {
      console.error('문제 추가 실패:', error);
      toast.error('문제 추가에 실패했습니다.');
    }
  };

  // 여러 문제 일괄 추가
  const handleAddMultipleProblems = async (problemIds: string[]) => {
    try {
      const response = await fetch(`/api/learning-materials/${materialId}/problems/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problemIds }),
      });

      if (!response.ok) {
        throw new Error('문제 일괄 추가에 실패했습니다.');
      }

      const data = await response.json();

      // 추가된 문제들을 다시 로드
      const problemsResponse = await fetch(`/api/learning-materials/${materialId}/problems`);
      if (problemsResponse.ok) {
        const problemsData = await problemsResponse.json();
        setProblems(problemsData.data.problems);
      }

      toast.success(`${data.added}개 문제가 추가되었습니다.`);
      if (data.skipped > 0) {
        toast.info(`${data.skipped}개 문제는 이미 연결되어 있습니다.`);
      }
    } catch (error) {
      console.error('문제 일괄 추가 실패:', error);
      toast.error('문제 일괄 추가에 실패했습니다.');
    }
  };

  // 문제 제거
  const handleRemoveProblem = async (problemId: string) => {
    try {
      const response = await fetch(
        `/api/learning-materials/${materialId}/problems?problemId=${problemId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('문제 제거에 실패했습니다.');
      }

      setProblems(problems.filter((p) => p.id !== problemId));
      toast.success('문제가 제거되었습니다.');
    } catch (error) {
      console.error('문제 제거 실패:', error);
      toast.error('문제 제거에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">학습자료를 찾을 수 없습니다.</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">학습자료 편집</h1>
        <p className="mt-2 text-gray-600">학습자료 정보를 수정하고 문제를 관리하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 학습자료 정보 편집 */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">학습자료 정보</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="학습자료 제목을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="학습자료 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="학습자료 내용을 입력하세요"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">과목</Label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">과목 선택</option>
                  <option value="MATH">수학</option>
                  <option value="SCIENCE">과학</option>
                  <option value="KOREAN">국어</option>
                  <option value="ENGLISH">영어</option>
                  <option value="SOCIAL">사회</option>
                </select>
              </div>

              <div>
                <Label htmlFor="difficulty">난이도</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">난이도 선택</option>
                  <option value="EASY">쉬움</option>
                  <option value="MEDIUM">보통</option>
                  <option value="HARD">어려움</option>
                  <option value="EXPERT">전문가</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="estimatedTime">예상 학습 시간 (분)</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                placeholder="예상 학습 시간을 입력하세요"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* 연결된 문제 관리 */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">연결된 문제</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowProblemModal(true)} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                문제 추가
              </Button>
              <Button onClick={() => setShowProblemModal(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                여러 문제 추가
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {problems.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>연결된 문제가 없습니다.</p>
                <p className="mt-1 text-sm">문제를 추가해보세요.</p>
              </div>
            ) : (
              problems.map((problem) => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  onRemove={() => handleRemoveProblem(problem.id)}
                  showRemoveButton
                />
              ))
            )}
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>총 {problems.length}개 문제</span>
              <span>예상 점수: {problems.reduce((sum, p) => sum + p.points, 0)}점</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 문제 선택 모달 */}
      <ProblemSelectionModal
        open={showProblemModal}
        onOpenChange={setShowProblemModal}
        onSelectProblem={handleAddProblem}
        onSelectMultipleProblems={handleAddMultipleProblems}
        excludeProblemIds={problems.map((p) => p.id)}
        allowMultiple={true}
      />
    </div>
  );
}
