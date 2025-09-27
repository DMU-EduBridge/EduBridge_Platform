import { useCallback, useState } from 'react';

interface ProblemAnswer {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  problemTitle: string;
  completedAt: string;
}

interface UseProgressReturn {
  completedProblems: string[];
  problemAnswers: Record<string, ProblemAnswer>;
  addCompletedProblem: (problemId: string, answer: ProblemAnswer) => void;
  clearProgress: () => void;
  initializeProgress: (studyId: string, currentIndex: number, totalCount: number) => void;
}

export function useProgress(studyId: string): UseProgressReturn {
  const [completedProblems, setCompletedProblems] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`completed-problems-${studyId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [problemAnswers, setProblemAnswers] = useState<Record<string, ProblemAnswer>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`problem-answers-${studyId}`);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const addCompletedProblem = useCallback(
    (problemId: string, answer: ProblemAnswer) => {
      setCompletedProblems((prev) => {
        if (!prev.includes(problemId)) {
          const newArray = [...prev, problemId];
          if (typeof window !== 'undefined') {
            localStorage.setItem(`completed-problems-${studyId}`, JSON.stringify(newArray));
          }
          return newArray;
        }
        return prev;
      });

      setProblemAnswers((prev) => {
        const newAnswers = { ...prev, [problemId]: answer };
        if (typeof window !== 'undefined') {
          localStorage.setItem(`problem-answers-${studyId}`, JSON.stringify(newAnswers));
        }
        return newAnswers;
      });
    },
    [studyId],
  );

  const clearProgress = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`completed-problems-${studyId}`);
      localStorage.removeItem(`problem-answers-${studyId}`);
    }
    setCompletedProblems([]);
    setProblemAnswers({});
  }, [studyId]);

  const initializeProgress = useCallback(
    (studyId: string, currentIndex: number, totalCount: number) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`completed-problems-${studyId}`);
        if (saved) {
          const completed = JSON.parse(saved);
          if (currentIndex === 1 && completed.length >= totalCount) {
            localStorage.removeItem(`completed-problems-${studyId}`);
            localStorage.removeItem(`problem-answers-${studyId}`);
            setCompletedProblems([]);
            setProblemAnswers({});
          }
        }
      }
    },
    [],
  );

  return {
    completedProblems,
    problemAnswers,
    addCompletedProblem,
    clearProgress,
    initializeProgress,
  };
}
