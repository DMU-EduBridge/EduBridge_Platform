/**
 * 공통 문제 관련 타입 정의
 * 여러 컴포넌트에서 공유되는 타입들을 중앙화
 */

import type { Problem } from '@/types/domain/problem';

/**
 * 문제 통계 타입
 */
export interface ProblemStats {
  totalAttempts: number;
  correctAttempts: number;
  correctRate: number;
  // 전체 시스템 통계
  totalProblems?: number;
  activeProblems?: number;
  systemTotalAttempts?: number;
  systemCorrectRate?: number;
}

/**
 * 문제 시도 결과 타입
 */
export interface ProblemAttempt {
  id: string;
  problemId: string;
  userId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  createdAt: Date;
}

/**
 * 문제 제출 데이터 타입
 */
export interface ProblemSubmissionData {
  problemId: string;
  selectedAnswer: string;
  timeSpent: number;
}

/**
 * 문제 네비게이션 타입
 */
export interface ProblemNavigationProps {
  currentIndex: number;
  totalProblems: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

/**
 * 문제 상세 클라이언트 Props 타입
 */
export interface ProblemDetailClientProps {
  problem: Problem;
  onAnswerSubmit: (data: ProblemSubmissionData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
}

/**
 * 문제 카드 Props 타입
 */
export interface ProblemCardProps {
  problem: Problem;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  onClick?: () => void;
}

/**
 * 문제 옵션 Props 타입
 */
export interface ProblemOptionsProps {
  options: string[];
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  disabled?: boolean;
}

/**
 * 문제 설명 Props 타입
 */
export interface ProblemExplanationProps {
  explanation: string;
  isVisible: boolean;
}

/**
 * 문제 내용 Props 타입
 */
export interface ProblemContentProps {
  content: string;
  title: string;
}

/**
 * 문제 헤더 Props 타입
 */
export interface ProblemHeaderProps {
  title: string;
  difficulty: string;
  subject: string;
  points: number;
  timeLimit?: number;
}

/**
 * 문제 액션 Props 타입
 */
export interface ProblemActionsProps {
  onSubmit: () => void;
  onSkip?: () => void;
  onHint?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * 문제 경과 시간 Props 타입
 */
export interface ProblemElapsedTimeProps {
  timeSpent: number;
  timeLimit?: number;
  isActive: boolean;
}

/**
 * 문제 생성 폼 Props 타입
 */
export interface ProblemGenerationFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

/**
 * 문제 리뷰 클라이언트 Props 타입
 */
export interface ProblemReviewClientProps {
  problems: Problem[];
  onProblemSelect: (problem: Problem) => void;
  selectedProblemId?: string;
}

/**
 * 문제 관리 클라이언트 Props 타입
 */
export interface ProblemManageClientProps {
  problems: Problem[];
  stats: ProblemStats;
  onEdit: (problem: Problem) => void;
  onDelete: (problemId: string) => void;
  onView: (problem: Problem) => void;
  isLoading?: boolean;
}

/**
 * 학습용 문제 타입 (시도 정보 포함)
 */
export interface ProblemWithAttempt extends Problem {
  attempt?: ProblemAttempt;
  isCompleted?: boolean;
  isCorrect?: boolean;
}

/**
 * 학습 문제 클라이언트 Props 타입
 */
export interface StudyProblemsClientProps {
  problems: ProblemWithAttempt[];
  onProblemSelect: (problem: ProblemWithAttempt) => void;
  selectedProblemId?: string;
  isLoading?: boolean;
}

/**
 * 학습 문제 리뷰 클라이언트 Props 타입
 */
export interface StudyProblemReviewClientProps {
  problem: ProblemWithAttempt;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: (data: ProblemSubmissionData) => void;
  isLoading?: boolean;
}

/**
 * 문제 선택 모달 Props 타입
 */
export interface ProblemSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (problem: Problem) => void;
  problems: Problem[];
  selectedProblems?: Problem[];
  multiple?: boolean;
}

/**
 * 학습 자료 편집 클라이언트 Props 타입
 */
export interface LearningMaterialEditClientProps {
  problems: Problem[];
  onProblemAdd: (problem: Problem) => void;
  onProblemRemove: (problemId: string) => void;
  onSave: () => void;
  isLoading?: boolean;
}

