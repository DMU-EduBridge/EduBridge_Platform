'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface ProblemSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProblem: (problemId: string) => void;
  onSelectMultipleProblems?: (problemIds: string[]) => void;
  excludeProblemIds?: string[];
  allowMultiple?: boolean;
}

export function ProblemSelectionModal({
  open,
  onOpenChange,
  onSelectProblem,
  onSelectMultipleProblems,
  excludeProblemIds = [],
  allowMultiple = false,
}: ProblemSelectionModalProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [previewProblem, setPreviewProblem] = useState<Problem | null>(null);

  // 문제 목록 로드
  useEffect(() => {
    if (open) {
      // 모달이 열릴 때 상태 초기화
      setSearch('');
      setSelectedSubject('');
      setSelectedDifficulty('');
      setSelectedProblemIds([]);
      setPreviewProblem(null);
      fetchProblems();
    }
  }, [open]);

  // 필터링된 문제 목록 업데이트
  useEffect(() => {
    let filtered = problems.filter(
      (problem) => !excludeProblemIds.includes(problem.id) && problem.isActive,
    );

    if (search) {
      filtered = filtered.filter(
        (problem) =>
          problem.title.toLowerCase().includes(search.toLowerCase()) ||
          problem.content.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter((problem) => problem.subject === selectedSubject);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((problem) => problem.difficulty === selectedDifficulty);
    }

    setFilteredProblems(filtered);
  }, [problems, search, selectedSubject, selectedDifficulty, excludeProblemIds]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/problems?limit=100');
      if (!response.ok) {
        throw new Error('문제 목록을 불러올 수 없습니다.');
      }
      const data = await response.json();
      const problemsData = data.data.problems || [];
      setProblems(problemsData);
    } catch (error) {
      console.error('문제 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = (problemId: string) => {
    onSelectProblem(problemId);
    onOpenChange(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      case 'EXPERT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '쉬움';
      case 'MEDIUM':
        return '보통';
      case 'HARD':
        return '어려움';
      case 'EXPERT':
        return '전문가';
      default:
        return difficulty;
    }
  };

  const getSubjectLabel = (subject: string) => {
    switch (subject) {
      case 'MATH':
        return '수학';
      case 'SCIENCE':
        return '과학';
      case 'KOREAN':
        return '국어';
      case 'ENGLISH':
        return '영어';
      case 'SOCIAL':
        return '사회';
      default:
        return subject;
    }
  };

  // 다중 선택 핸들러
  const handleToggleSelection = (problemId: string) => {
    if (selectedProblemIds.includes(problemId)) {
      setSelectedProblemIds(selectedProblemIds.filter((id) => id !== problemId));
    } else {
      setSelectedProblemIds([...selectedProblemIds, problemId]);
    }
  };

  // 일괄 추가 핸들러
  const handleBatchAdd = async () => {
    if (onSelectMultipleProblems && selectedProblemIds.length > 0) {
      await onSelectMultipleProblems(selectedProblemIds);
      setSelectedProblemIds([]);
      onOpenChange(false);
    }
  };

  // 미리보기 핸들러
  const handlePreview = (problem: Problem) => {
    setPreviewProblem(problem);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>문제 선택</DialogTitle>
        </DialogHeader>

        <div className="flex h-full flex-col">
          {/* 검색 및 필터 */}
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="문제 제목이나 내용으로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-4">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">모든 과목</option>
                <option value="MATH">수학</option>
                <option value="SCIENCE">과학</option>
                <option value="KOREAN">국어</option>
                <option value="ENGLISH">영어</option>
                <option value="SOCIAL">사회</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">모든 난이도</option>
                <option value="EASY">쉬움</option>
                <option value="MEDIUM">보통</option>
                <option value="HARD">어려움</option>
                <option value="EXPERT">전문가</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedSubject('');
                  setSelectedDifficulty('');
                }}
              >
                <X className="mr-2 h-4 w-4" />
                초기화
              </Button>

              {allowMultiple && selectedProblemIds.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleBatchAdd}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  선택한 {selectedProblemIds.length}개 추가
                </Button>
              )}
            </div>
          </div>

          {/* 문제 목록 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProblems.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>선택 가능한 문제가 없습니다.</p>
                <p className="mt-1 text-sm">검색 조건을 변경해보세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className={`rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
                      selectedProblemIds.includes(problem.id) ? 'border-blue-200 bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {allowMultiple && (
                            <input
                              type="checkbox"
                              checked={selectedProblemIds.includes(problem.id)}
                              onChange={() => handleToggleSelection(problem.id)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="mb-2 font-medium text-gray-900">{problem.title}</h3>
                            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                              {problem.content}
                            </p>

                            <div className="flex items-center gap-2">
                              <Badge className={getDifficultyColor(problem.difficulty)}>
                                {getDifficultyLabel(problem.difficulty)}
                              </Badge>
                              <Badge variant="outline">{getSubjectLabel(problem.subject)}</Badge>
                              <span className="text-xs text-gray-500">{problem.points}점</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePreview(problem)}>
                          미리보기
                        </Button>
                        {!allowMultiple && (
                          <Button size="sm" onClick={() => handleSelectProblem(problem.id)}>
                            <Plus className="mr-2 h-4 w-4" />
                            추가
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 정보 */}
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>총 {filteredProblems.length}개 문제</span>
              {allowMultiple && selectedProblemIds.length > 0 && (
                <span className="text-blue-600">{selectedProblemIds.length}개 선택됨</span>
              )}
            </div>
          </div>
        </div>

        {/* 미리보기 패널 */}
        {previewProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">문제 미리보기</h2>
                <Button variant="outline" size="sm" onClick={() => setPreviewProblem(null)}>
                  ✕
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{previewProblem.title}</h3>
                  <div className="mt-2 flex gap-2">
                    <Badge className={getDifficultyColor(previewProblem.difficulty)}>
                      {getDifficultyLabel(previewProblem.difficulty)}
                    </Badge>
                    <Badge variant="outline">{getSubjectLabel(previewProblem.subject)}</Badge>
                    <span className="text-sm text-gray-500">{previewProblem.points}점</span>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium">문제 내용</h4>
                  <p className="whitespace-pre-wrap text-sm">{previewProblem.content}</p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setPreviewProblem(null)}>닫기</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
