'use client';

import { AIQuestionGenerationModal } from '@/components/problems/ai-question-generation-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useProblems } from '@/hooks/problems';
import {
  Problem,
  getProblemDifficultyConfig,
  getProblemStatusConfig,
  getProblemTypeConfig,
} from '@/types/domain/problem';
import {
  Clock,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// 과목명을 한글로 변환하는 함수
const getSubjectLabel = (subject: string): string => {
  const subjectMap: Record<string, string> = {
    KOREAN: '국어',
    MATH: '수학',
    ENGLISH: '영어',
    SCIENCE: '과학',
    SOCIAL_STUDIES: '사회',
    HISTORY: '역사',
    GEOGRAPHY: '지리',
    PHYSICS: '물리',
    CHEMISTRY: '화학',
    BIOLOGY: '생물',
    COMPUTER_SCIENCE: '컴퓨터과학',
    ART: '미술',
    MUSIC: '음악',
    PHYSICAL_EDUCATION: '체육',
    ETHICS: '윤리',
    OTHER: '기타',
  };
  return subjectMap[subject] || subject;
};

// Loading skeleton component
function ProblemsSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>제목</TableHead>
          <TableHead>과목</TableHead>
          <TableHead>유형</TableHead>
          <TableHead>난이도</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>생성 방식</TableHead>
          <TableHead>생성일</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            </TableCell>
            <TableCell>
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
            </TableCell>
            <TableCell>
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
            </TableCell>
            <TableCell>
              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
            </TableCell>
            <TableCell>
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Error component
function ProblemsError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <h3 className="mb-2 text-lg font-semibold text-red-800">문제를 불러올 수 없습니다</h3>
        <p className="mb-4 text-red-600">{error.message}</p>
        <Button onClick={onRetry} variant="outline">
          다시 시도
        </Button>
      </CardContent>
    </Card>
  );
}

// Edit Problem Modal Component
function EditProblemModal({
  problem,
  isOpen,
  onClose,
  onSave,
}: {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProblem: Partial<Problem>) => void;
}) {
  const [formData, setFormData] = useState({
    title: problem?.title || '',
    description: problem?.description || '',
    content: problem?.content || '',
    subject: problem?.subject || 'MATH',
    difficulty: problem?.difficulty || 'EASY',
    type: problem?.type || 'MULTIPLE_CHOICE',
    correctAnswer: problem?.correctAnswer || '',
    explanation: problem?.explanation || '',
    points: problem?.points || 1,
    timeLimit: problem?.timeLimit || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!problem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>문제 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">과목</Label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="KOREAN">국어</option>
                <option value="MATH">수학</option>
                <option value="ENGLISH">영어</option>
                <option value="SCIENCE">과학</option>
                <option value="SOCIAL_STUDIES">사회</option>
                <option value="HISTORY">역사</option>
                <option value="GEOGRAPHY">지리</option>
                <option value="PHYSICS">물리</option>
                <option value="CHEMISTRY">화학</option>
                <option value="BIOLOGY">생물</option>
                <option value="COMPUTER_SCIENCE">컴퓨터과학</option>
                <option value="ART">미술</option>
                <option value="MUSIC">음악</option>
                <option value="PHYSICAL_EDUCATION">체육</option>
                <option value="ETHICS">윤리</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="content">문제 내용</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">난이도</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="EASY">쉬움</option>
                <option value="MEDIUM">보통</option>
                <option value="HARD">어려움</option>
                <option value="EXPERT">전문가</option>
              </select>
            </div>
            <div>
              <Label htmlFor="type">유형</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="MULTIPLE_CHOICE">객관식</option>
                <option value="SHORT_ANSWER">단답형</option>
                <option value="ESSAY">서술형</option>
                <option value="TRUE_FALSE">참/거짓</option>
                <option value="CODING">코딩</option>
                <option value="MATH">수학</option>
              </select>
            </div>
            <div>
              <Label htmlFor="points">점수</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="correctAnswer">정답</Label>
            <Input
              id="correctAnswer"
              value={formData.correctAnswer}
              onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="explanation">해설</Label>
            <Textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="timeLimit">시간 제한 (분)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="1"
              value={formData.timeLimit || ''}
              onChange={(e) =>
                handleInputChange('timeLimit', e.target.value ? parseInt(e.target.value) : null)
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProblemsClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [creationType, setCreationType] = useState<string>('all'); // 페이지당 항목 수
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProblemId, setDeletingProblemId] = useState<string | null>(null);

  // TanStack Query 훅 사용
  const {
    problems: problemsQuery,
    stats: statsQuery,
    update: updateMutation,
    delete: deleteMutation,
  } = useProblems({
    ...(searchTerm && { search: searchTerm }),
    ...(selectedSubject !== 'all' && { subject: selectedSubject }),
    ...(selectedDifficulty !== 'all' && { difficulty: selectedDifficulty }),
    ...(creationType !== 'all' && { creationType: creationType }),
    page: currentPage,
    limit: pageSize,
  });

  const problems = problemsQuery.data?.problems || [];
  const totalCount = problemsQuery.data?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const stats = statsQuery.data;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleFilterChange = (subject: string, difficulty: string, creationType?: string) => {
    setSelectedSubject(subject);
    setSelectedDifficulty(difficulty);
    if (creationType) {
      setCreationType(creationType);
    }
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  const handleEdit = (problem: Problem) => {
    setEditingProblem(problem);
    setEditModalOpen(true);
  };

  const handleDelete = (problemId: string) => {
    setDeletingProblemId(problemId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProblemId) return;

    try {
      await deleteMutation.mutateAsync(deletingProblemId);
      setDeleteDialogOpen(false);
      setDeletingProblemId(null);
    } catch (error) {
      console.error('문제 삭제 실패:', error);
    }
  };

  const handleSaveEdit = async (updatedProblem: Partial<Problem>) => {
    if (!editingProblem) return;

    try {
      await updateMutation.mutateAsync({
        id: editingProblem.id,
        data: updatedProblem,
      });
      setEditModalOpen(false);
      setEditingProblem(null);
    } catch (error) {
      console.error('문제 수정 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">문제 관리</h1>
          <p className="mt-2 text-gray-600">
            학습 문제를 생성하고 관리하여 학생들의 학습을 도와주세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100"
            onClick={() => setAiModalOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            AI 문제 생성
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />새 문제 생성
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 문제 수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : stats?.totalProblems || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 정답률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : `${stats?.averageSuccessRate || 0}%`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 시도 횟수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : stats?.totalAttempts || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 문제</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : stats?.activeProblems || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 문제 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle className="mb-4 flex items-center justify-between">
            <span>문제 목록</span>
            <span className="text-sm font-normal text-gray-500">
              총 {totalCount}개 문제 (페이지 {currentPage} / {totalPages})
            </span>
          </CardTitle>
          {/* 검색 및 필터 */}
          <div className="mt-4 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="문제 제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedSubject}
                onChange={(e) => handleFilterChange(e.target.value, selectedDifficulty)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">모든 과목</option>
                <option value="MATH">수학</option>
                <option value="ENGLISH">영어</option>
                <option value="KOREAN">국어</option>
                <option value="SCIENCE">과학</option>
                <option value="SOCIAL_STUDIES">사회</option>
                <option value="HISTORY">역사</option>
                <option value="GEOGRAPHY">지리</option>
                <option value="PHYSICS">물리</option>
                <option value="CHEMISTRY">화학</option>
                <option value="BIOLOGY">생물</option>
                <option value="COMPUTER_SCIENCE">컴퓨터과학</option>
                <option value="ART">미술</option>
                <option value="MUSIC">음악</option>
                <option value="PHYSICAL_EDUCATION">체육</option>
                <option value="ETHICS">윤리</option>
                <option value="OTHER">기타</option>
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => handleFilterChange(selectedSubject, e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">모든 난이도</option>
                <option value="EASY">쉬움</option>
                <option value="MEDIUM">보통</option>
                <option value="HARD">어려움</option>
                <option value="EXPERT">전문가</option>
              </select>
              <select
                value={creationType}
                onChange={(e) =>
                  handleFilterChange(selectedSubject, selectedDifficulty, e.target.value)
                }
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">모든 생성 방식</option>
                <option value="ai">AI 생성</option>
                <option value="manual">직접 생성</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {problemsQuery.isLoading ? (
            <ProblemsSkeleton />
          ) : problemsQuery.error ? (
            <ProblemsError
              error={problemsQuery.error as Error}
              onRetry={() => problemsQuery.refetch()}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>과목</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>난이도</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>생성 방식</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem: Problem) => {
                    const difficultyConfig = getProblemDifficultyConfig(problem.difficulty);
                    const statusConfig = getProblemStatusConfig(problem.status);
                    const typeConfig = getProblemTypeConfig(problem.type);

                    return (
                      <TableRow key={problem.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-xs truncate" title={problem.title}>
                            {problem.title}
                          </div>
                        </TableCell>
                        <TableCell>{getSubjectLabel(problem.subject)}</TableCell>
                        <TableCell>{typeConfig.label}</TableCell>
                        <TableCell>
                          <Badge className={difficultyConfig.color}>{difficultyConfig.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              problem.isAIGenerated
                                ? 'border-purple-200 bg-purple-50 text-purple-700'
                                : 'border-blue-200 bg-blue-50 text-blue-700'
                            }
                          >
                            {problem.isAIGenerated ? (
                              <>
                                <Sparkles className="mr-1 h-3 w-3" />
                                AI 생성
                              </>
                            ) : (
                              <>
                                <Edit className="mr-1 h-3 w-3" />
                                직접 생성
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {problem.createdAt
                            ? new Date(problem.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/problems/${problem.id}`} prefetch>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-1 h-4 w-4" />
                                보기
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(problem)}>
                              <Edit className="mr-1 h-4 w-4" />
                              수정
                            </Button>
                            <AlertDialog
                              open={deleteDialogOpen && deletingProblemId === problem.id}
                              onOpenChange={setDeleteDialogOpen}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDelete(problem.id)}
                                >
                                  <Trash2 className="mr-1 h-4 w-4" />
                                  삭제
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>문제 삭제 확인</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    정말로 이 문제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    삭제
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {totalCount}개 중 {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, totalCount)}개 표시
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {!problemsQuery.isLoading && !problemsQuery.error && problems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">문제를 찾을 수 없습니다</h3>
            <p className="mb-4 text-gray-600">검색 조건에 맞는 문제가 없습니다.</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />새 문제 생성하기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI 문제 생성 모달 */}
      <AIQuestionGenerationModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onQuestionsGenerated={() => {
          // 문제 목록 새로고침
          problemsQuery.refetch();
        }}
      />

      {/* 문제 수정 모달 */}
      <EditProblemModal
        problem={editingProblem}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingProblem(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
