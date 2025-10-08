'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { IncorrectAnswerItem, IncorrectAnswersStats, IncorrectProblem } from '@/types';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Download, RotateCcw } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// 타입 정의
type Problem = IncorrectProblem;

type IncorrectAnswerNoteItem = IncorrectAnswerItem;

interface IncorrectAnswersData {
  incorrectAnswers: IncorrectAnswerNoteItem[];
  subjects: string[];
  stats: IncorrectAnswersStats;
}

interface IncorrectAnswersDetailClientProps {
  session: Session;
  initialData: IncorrectAnswersData | null;
}

export function IncorrectAnswersDetailClient({
  session,
  initialData,
}: IncorrectAnswersDetailClientProps) {
  const router = useRouter();
  const [incorrectAnswersData, _setIncorrectAnswersData] = useState<IncorrectAnswersData | null>(
    initialData,
  );
  const [selectedSubject, setSelectedSubject] = useState<string>('전체');
  const [_selectedProblem, _setSelectedProblem] = useState<Problem | null>(null);

  if (!incorrectAnswersData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  const { incorrectAnswers, subjects, stats } = incorrectAnswersData;

  // 단일 문제 재풀이: 해당 문제만 풀고 완료 시 오답 노트로 복귀
  const retryProblem = async (problemId: string) => {
    try {
      // studyId 조회 (배치 API 우선)
      let studyId: string | null = null;
      try {
        const batch = await fetch(`/api/problems/material?ids=${encodeURIComponent(problemId)}`);
        if (batch.ok) {
          const bj = await batch.json();
          const rec = (bj?.data || [])[0];
          if (rec?.studyId) studyId = rec.studyId as string;
        }
      } catch {}

      if (!studyId) {
        try {
          const res = await fetch(`/api/problems/${encodeURIComponent(problemId)}/material`);
          if (res.ok) {
            const js = await res.json();
            if (js?.studyId) studyId = js.studyId as string;
          }
        } catch {}
      }

      if (!studyId) {
        // 학습 자료 매핑이 없으면 단건 상세로 폴백
        router.push(`/problems/${encodeURIComponent(problemId)}?retry=true`);
        return;
      }

      const idsParam = encodeURIComponent(problemId);
      router.push(
        `/my/learning/${encodeURIComponent(studyId)}/problems/${encodeURIComponent(
          problemId,
        )}?startNewAttempt=1&wrongOnly=1&ids=${idsParam}&from=incorrect`,
      );
    } catch (e) {
      console.error('단일 문제 재풀이 이동 실패:', e);
      router.push('/my/learning?error=server-error');
    }
  };

  // 세트 단위 틀린 문제만 풀기
  const startWrongOnlySession = async (note: IncorrectAnswerNoteItem) => {
    try {
      const wrongIds = (note.problems || []).map((p) => p.id);
      if (wrongIds.length === 0) {
        return;
      }

      // 배치 조회로 매핑 상태 확인
      let studyId: string | null = null;
      try {
        const batch = await fetch(
          `/api/problems/material?ids=${encodeURIComponent(wrongIds.join(','))}`,
        );
        if (batch.ok) {
          const bj = await batch.json();
          const found = (bj?.data || []).find((r: any) => r.studyId);
          if (found?.studyId) studyId = found.studyId as string;
        }
      } catch {}
      // 그래도 없으면 개별 조회 시도
      if (!studyId) {
        for (const pid of wrongIds) {
          try {
            const res = await fetch(`/api/problems/${encodeURIComponent(pid)}/material`);
            if (!res.ok) continue;
            const json = await res.json();
            if (json?.studyId) {
              studyId = json.studyId as string;
              break;
            }
          } catch (_) {}
        }
      }

      if (!studyId) {
        // note.id가 학습 자료 id인 경우가 많으므로 우선 시도, 없으면 첫 문제 폴백
        const fallbackStudyId = (note as any)?.id || null;
        if (fallbackStudyId) {
          const idsParam = encodeURIComponent(wrongIds.join(','));
          router.push(
            `/my/learning/${encodeURIComponent(fallbackStudyId)}/problems?wrongOnly=1&ids=${idsParam}`,
          );
          return;
        }
        // 어떤 문제도 학습 자료에 매핑되지 않은 경우: 첫 문제로 직접 이동 (폴백)
        router.push(`/problems/${encodeURIComponent(wrongIds[0])}?retry=true`);
        return;
      }
      const idsParam = encodeURIComponent(wrongIds.join(','));
      router.push(
        `/my/learning/${encodeURIComponent(studyId)}/problems?wrongOnly=1&ids=${idsParam}`,
      );
    } catch (e) {
      console.error('틀린 문제 세션 시작 실패:', e);
      router.push('/my/learning?error=server-error');
    }
  };

  // 과목별 필터링
  const filteredAnswers =
    selectedSubject === '전체'
      ? incorrectAnswers
      : incorrectAnswers.filter((answer) => answer.subject === selectedSubject);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '쉬움';
      case 'medium':
        return '보통';
      case 'hard':
        return '어려움';
      default:
        return '보통';
    }
  };

  const getStatusIcon = (statusColor: string) => {
    switch (statusColor) {
      case 'red':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'yellow':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'green':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">오답 노트</h1>
              <p className="mt-2 text-gray-600">틀린 문제들을 다시 풀어보고 복습하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {/* 오답 노트 목록 */}
        <Card className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedSubject === '전체' ? '모든 오답 노트' : selectedSubject}
            </h2>

            {/* 과목 필터 한 줄 배치 */}
            <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
              <button
                onClick={() => setSelectedSubject('전체')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedSubject === '전체'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                전체 ({incorrectAnswers.length})
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    selectedSubject === subject
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {subject} ({incorrectAnswers.filter((a) => a.subject === subject).length})
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredAnswers.map((answer) => (
                <div key={answer.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{answer.subject}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          answer.gradeColor === 'green'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {answer.grade}
                      </span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(answer.statusColor)}
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            answer.statusColor === 'red'
                              ? 'bg-red-100 text-red-700'
                              : answer.statusColor === 'yellow'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {answer.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => startWrongOnlySession(answer)}
                        title="세트의 모든 틀린 문제를 순서대로 풉니다"
                      >
                        세트 전체 다시 풀기
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>다운로드</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>오답: {answer.incorrectCount}문제</p>
                      <p>재시도: {answer.retryCount}문제</p>
                    </div>
                    <div>
                      <p>완료: {answer.completedCount}문제</p>
                      <p>총 문제: {answer.totalProblems}문제</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    마지막 업데이트: {new Date(answer.lastUpdated).toLocaleDateString('ko-KR')}
                  </div>

                  {/* 문제 목록 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">틀린 문제들</h4>
                    {answer.problems.map((problem) => (
                      <div
                        key={problem.id}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <p className="mb-1 text-sm font-medium text-gray-900">
                              {problem.question}
                            </p>
                            <div className="mb-2 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}
                              >
                                {getDifficultyText(problem.difficulty)}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                {problem.topic}
                              </span>
                              <span className="text-xs text-gray-500">
                                {problem.attempts}회 시도
                              </span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryProblem(problem.id)}
                            className="ml-4 flex items-center gap-1"
                            title="이 문제 1개만 다시 풀기"
                          >
                            <RotateCcw className="h-3 w-3" />이 문제만 다시 풀기
                          </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex gap-4">
                            <div>
                              <span className="text-gray-600">내 답:</span>
                              <span className="ml-1 text-red-600">{problem.myAnswer}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">정답:</span>
                              <span className="ml-1 text-green-600">{problem.correctAnswer}</span>
                            </div>
                          </div>
                          <div className="rounded bg-blue-50 p-2 text-gray-700">
                            <span className="text-gray-600">해설:</span> {problem.explanation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredAnswers.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500">오답 노트가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
