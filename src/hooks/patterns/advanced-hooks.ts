/**
 * 고급 React Hook 패턴들
 */

import type { Problem } from '@/types/domain/problem';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

// Compound Hook Pattern
export function useProblemManagement(initialProblems: Problem[] = []) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{
    search?: string;
    difficulty?: string;
    subject?: string;
    type?: string;
  }>({});

  // 필터링된 문제들
  const filteredProblems = useMemo(() => {
    let filtered = problems;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (problem) =>
          problem.title.toLowerCase().includes(searchLower) ||
          problem.content.toLowerCase().includes(searchLower),
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter((problem) => problem.difficulty === filters.difficulty);
    }

    if (filters.subject) {
      filtered = filtered.filter((problem) => problem.subject === filters.subject);
    }

    if (filters.type) {
      filtered = filtered.filter((problem) => problem.type === filters.type);
    }

    return filtered;
  }, [problems, filters]);

  // 선택된 문제들
  const selectedProblemObjects = useMemo(() => {
    return Array.from(selectedProblems)
      .map((id) => problems.find((problem) => problem.id === id))
      .filter(Boolean) as Problem[];
  }, [selectedProblems, problems]);

  // 액션들
  const addProblem = useCallback((problem: Problem) => {
    setProblems((prev) => [...prev, problem]);
  }, []);

  const updateProblem = useCallback((id: string, updates: Partial<Problem>) => {
    setProblems((prev) =>
      prev.map((problem) => (problem.id === id ? { ...problem, ...updates } : problem)),
    );
  }, []);

  const removeProblem = useCallback((id: string) => {
    setProblems((prev) => prev.filter((problem) => problem.id !== id));
    setSelectedProblems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedProblems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedProblems(new Set(filteredProblems.map((problem) => problem.id)));
  }, [filteredProblems]);

  const clearSelection = useCallback(() => {
    setSelectedProblems(new Set());
  }, []);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    // 상태
    problems: filteredProblems,
    selectedProblems: selectedProblemObjects,
    selectedIds: selectedProblems,
    filters,

    // 액션
    addProblem,
    updateProblem,
    removeProblem,
    toggleSelection,
    selectAll,
    clearSelection,
    updateFilters,
    clearFilters,

    // 유틸리티
    isSelected: (id: string) => selectedProblems.has(id),
    hasSelection: selectedProblems.size > 0,
    selectionCount: selectedProblems.size,
  };
}

// Custom Hook with Reducer Pattern
interface ProblemState {
  problems: Problem[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

type ProblemAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROBLEMS'; payload: Problem[] }
  | { type: 'ADD_PROBLEM'; payload: Problem }
  | { type: 'UPDATE_PROBLEM'; payload: { id: string; updates: Partial<Problem> } }
  | { type: 'REMOVE_PROBLEM'; payload: string }
  | { type: 'CLEAR_ERROR' };

function problemReducer(state: ProblemState, action: ProblemAction): ProblemState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PROBLEMS':
      return {
        ...state,
        problems: action.payload,
        lastUpdated: new Date(),
        loading: false,
        error: null,
      };
    case 'ADD_PROBLEM':
      return {
        ...state,
        problems: [...state.problems, action.payload],
        lastUpdated: new Date(),
      };
    case 'UPDATE_PROBLEM':
      return {
        ...state,
        problems: state.problems.map((problem) =>
          problem.id === action.payload.id ? { ...problem, ...action.payload.updates } : problem,
        ),
        lastUpdated: new Date(),
      };
    case 'REMOVE_PROBLEM':
      return {
        ...state,
        problems: state.problems.filter((problem) => problem.id !== action.payload),
        lastUpdated: new Date(),
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function useProblemReducer(initialProblems: Problem[] = []) {
  const [state, dispatch] = useReducer(problemReducer, {
    problems: initialProblems,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const actions = useMemo(
    () => ({
      setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
      setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
      setProblems: (problems: Problem[]) => dispatch({ type: 'SET_PROBLEMS', payload: problems }),
      addProblem: (problem: Problem) => dispatch({ type: 'ADD_PROBLEM', payload: problem }),
      updateProblem: (id: string, updates: Partial<Problem>) =>
        dispatch({ type: 'UPDATE_PROBLEM', payload: { id, updates } }),
      removeProblem: (id: string) => dispatch({ type: 'REMOVE_PROBLEM', payload: id }),
      clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    }),
    [],
  );

  return { state, actions };
}

// Hook with Context Pattern
interface ProblemContextValue {
  problems: Problem[];
  addProblem: (problem: Problem) => void;
  updateProblem: (id: string, updates: Partial<Problem>) => void;
  removeProblem: (id: string) => void;
}

export function useProblemContext(): ProblemContextValue {
  // 실제 구현에서는 React.createContext를 사용
  return {
    problems: [],
    addProblem: () => {},
    updateProblem: () => {},
    removeProblem: () => {},
  };
}

// Hook with Memoization Pattern
export function useMemoizedProblemOperations(problems: Problem[]) {
  const memoizedStats = useMemo(() => {
    const total = problems.length;
    const byDifficulty = problems.reduce(
      (acc, problem) => {
        acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const bySubject = problems.reduce(
      (acc, problem) => {
        acc[problem.subject] = (acc[problem.subject] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const averagePoints = problems.reduce((sum, problem) => sum + problem.points, 0) / total || 0;

    return {
      total,
      byDifficulty,
      bySubject,
      averagePoints: Math.round(averagePoints * 100) / 100,
    };
  }, [problems]);

  const memoizedSearch = useCallback(
    (query: string) => {
      if (!query) return problems;
      const queryLower = query.toLowerCase();
      return problems.filter(
        (problem) =>
          problem.title.toLowerCase().includes(queryLower) ||
          problem.content.toLowerCase().includes(queryLower),
      );
    },
    [problems],
  );

  const memoizedFilter = useCallback(
    (criteria: { difficulty?: string; subject?: string; type?: string }) => {
      return problems.filter((problem) => {
        if (criteria.difficulty && problem.difficulty !== criteria.difficulty) return false;
        if (criteria.subject && problem.subject !== criteria.subject) return false;
        if (criteria.type && problem.type !== criteria.type) return false;
        return true;
      });
    },
    [problems],
  );

  return {
    stats: memoizedStats,
    search: memoizedSearch,
    filter: memoizedFilter,
  };
}

// Hook with Effect Pattern
export function useProblemEffects(problems: Problem[]) {
  const prevProblemsRef = useRef<Problem[]>([]);
  const [changeLog, setChangeLog] = useState<Array<{ type: string; timestamp: Date; data: any }>>(
    [],
  );

  useEffect(() => {
    const prevProblems = prevProblemsRef.current;

    if (prevProblems.length === 0 && problems.length > 0) {
      // 초기 로드
      setChangeLog((prev) => [
        ...prev,
        { type: 'INITIAL_LOAD', timestamp: new Date(), data: { count: problems.length } },
      ]);
    } else if (prevProblems.length < problems.length) {
      // 문제 추가
      const newProblems = problems.filter(
        (problem) => !prevProblems.some((prev) => prev.id === problem.id),
      );
      setChangeLog((prev) => [
        ...prev,
        { type: 'PROBLEMS_ADDED', timestamp: new Date(), data: { count: newProblems.length } },
      ]);
    } else if (prevProblems.length > problems.length) {
      // 문제 삭제
      const deletedProblems = prevProblems.filter(
        (prev) => !problems.some((problem) => problem.id === prev.id),
      );
      setChangeLog((prev) => [
        ...prev,
        {
          type: 'PROBLEMS_REMOVED',
          timestamp: new Date(),
          data: { count: deletedProblems.length },
        },
      ]);
    }

    prevProblemsRef.current = problems;
  }, [problems]);

  const clearChangeLog = useCallback(() => {
    setChangeLog([]);
  }, []);

  return {
    changeLog,
    clearChangeLog,
  };
}

// Hook with Ref Pattern
export function useProblemRefs() {
  const problemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollToProblem = useCallback((problemId: string) => {
    const element = problemRefs.current.get(problemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const registerRef = useCallback((problemId: string, element: HTMLElement | null) => {
    if (element) {
      problemRefs.current.set(problemId, element);
    } else {
      problemRefs.current.delete(problemId);
    }
  }, []);

  return {
    scrollToProblem,
    registerRef,
  };
}
