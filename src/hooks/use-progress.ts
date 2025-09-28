import { attemptService, learningService, progressService } from '@/services';
import { useCallback, useEffect, useState } from 'react';

interface ProblemAnswer {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  problemTitle: string;
  completedAt: string;
}

interface ProblemAnswers {
  [problemId: string]: ProblemAnswer;
}

interface ProblemProgress {
  selectedAnswer: string;
  startTime: string;
  lastAccessed: string;
}

interface LearningAttempt {
  problemId: string;
  isCorrect: boolean;
  selected: string;
  createdAt: string;
}

interface LearningStatus {
  totalProblems: number;
  completedProblems: number;
  correctAnswers: number;
  wrongAnswers: number;
  isCompleted: boolean;
  attempts: LearningAttempt[];
}

export function useProgress(studyId: string): {
  completedProblems: string[];
  setCompletedProblems: React.Dispatch<React.SetStateAction<string[]>>;
  problemAnswers: ProblemAnswers;
  problemProgress: Record<string, ProblemProgress>;
  learningStatus: LearningStatus | null;
  isLoading: boolean;
  addCompletedProblem: (problemId: string, answer: ProblemAnswer) => Promise<void>;
  saveProgress: (problemId: string, selectedAnswer: string, startTime: Date) => Promise<void>;
  getProgress: (problemId: string) => Promise<ProblemProgress | null>;
  clearProgress: () => Promise<void>;
  initializeProgress: (studyId: string, currentIndex: number, totalCount: number) => Promise<void>;
  loadLearningStatus: () => Promise<void>;
} {
  const [completedProblems, setCompletedProblems] = useState<string[]>([]);
  const [problemAnswers, setProblemAnswers] = useState<ProblemAnswers>({});
  const [problemProgress, setProblemProgress] = useState<Record<string, ProblemProgress>>({});
  const [learningStatus, setLearningStatus] = useState<LearningStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // API에서 학습 상태 로드
  const loadLearningStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await learningService.getLearningStatus(studyId);
      if (result.success && result.data) {
        setLearningStatus(result.data);

        // 완료된 문제 목록 설정 (DB 데이터만 사용)
        const completed = result.data.attempts.map((attempt: LearningAttempt) => attempt.problemId);
        setCompletedProblems(completed);

        // 문제별 답안 정보 설정
        const answers: ProblemAnswers = {};
        result.data.attempts.forEach((attempt: LearningAttempt) => {
          answers[attempt.problemId] = {
            isCorrect: attempt.isCorrect,
            selectedAnswer: attempt.selected, // 스키마에 맞게 수정
            correctAnswer: '', // 문제 정보에서 가져와야 함
            problemTitle: '', // 문제 정보에서 가져와야 함
            completedAt: attempt.createdAt,
          };
        });
        setProblemAnswers(answers);
      }
    } catch (error) {
      console.error('학습 상태 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [studyId]);

  // 컴포넌트 마운트 시 API에서 로드
  useEffect(() => {
    loadLearningStatus();
  }, [loadLearningStatus]);

  // localStorage 변경 감지 제거 (DB만 사용)

  const addCompletedProblem = useCallback(
    async (problemId: string, answer: ProblemAnswer) => {
      try {
        // API로 시도 기록 저장
        const result = await attemptService.createAttempt({
          problemId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
          timeSpent: 0, // 실제 시간 계산 필요
          startTime: answer.completedAt, // 시작 시간 전달
        });

        if (result.success) {
          // 학습 상태 다시 로드 (서버 데이터와 동기화)
          await loadLearningStatus();
        } else {
          console.error('시도 기록 저장 실패:', result.error);
        }
      } catch (error) {
        console.error('시도 기록 저장 실패:', error);
      }
    },
    [loadLearningStatus],
  );

  const saveProgress = useCallback(
    async (problemId: string, selectedAnswer: string, startTime: Date) => {
      // 로컬 상태 저장
      let validStartTime: Date;
      try {
        validStartTime = startTime instanceof Date ? startTime : new Date(startTime);
        if (isNaN(validStartTime.getTime())) {
          validStartTime = new Date();
        }
      } catch {
        validStartTime = new Date();
      }

      const progressData: ProblemProgress = {
        selectedAnswer,
        startTime: validStartTime.toISOString(),
        lastAccessed: new Date().toISOString(),
      };

      setProblemProgress((prev) => ({
        ...prev,
        [problemId]: progressData,
      }));

      // 서버에 임시 진행 상태 저장 (새로고침 시 복원용)
      try {
        await progressService.saveProgress(studyId, problemId, selectedAnswer, validStartTime);
      } catch (error) {
        console.error('진행 상태 서버 저장 실패:', error);
      }
    },
    [studyId],
  );

  const getProgress = useCallback(
    async (problemId: string): Promise<ProblemProgress | null> => {
      // 로컬 상태 먼저 확인
      const localProgress = problemProgress[problemId];
      if (localProgress) {
        return localProgress;
      }

      // 로컬에 없으면 서버에서 조회
      try {
        const result = await progressService.getProgress(studyId, problemId);
        if (result.success && result.progress && result.progress.length > 0) {
          const progressData = result.progress[0];
          if (progressData) {
            const serverProgress: ProblemProgress = {
              selectedAnswer: progressData.selectedAnswer,
              startTime: progressData.startTime,
              lastAccessed: progressData.lastAccessed,
            };

            // 로컬 상태에 저장
            setProblemProgress((prev) => ({
              ...prev,
              [problemId]: serverProgress,
            }));

            return serverProgress;
          }
        }
      } catch (error) {
        console.error('진행 상태 서버 조회 실패:', error);
      }

      return null;
    },
    [problemProgress, studyId],
  );

  const clearProgress = useCallback(async () => {
    try {
      // API로 진행 상태 삭제
      const result = await progressService.clearProgress(studyId);

      if (result.success) {
        // 로컬 상태 초기화
        setCompletedProblems([]);
        setProblemAnswers({});
        setProblemProgress({});
        setLearningStatus(null);

        // 학습 상태 다시 로드
        await loadLearningStatus();
      }
    } catch (error) {
      console.error('진행 상태 삭제 실패:', error);
    }
  }, [studyId, loadLearningStatus]);

  const initializeProgress = useCallback(
    async (_studyId: string, currentIndex: number, _totalCount: number) => {
      // 첫 번째 문제이고 모든 문제가 완료된 경우에만 초기화
      if (currentIndex === 1 && learningStatus?.isCompleted) {
        await clearProgress();
      }
    },
    [learningStatus, clearProgress],
  );

  return {
    completedProblems,
    setCompletedProblems,
    problemAnswers,
    problemProgress,
    learningStatus,
    isLoading,
    addCompletedProblem,
    saveProgress,
    getProgress,
    clearProgress,
    initializeProgress,
    loadLearningStatus,
  };
}
