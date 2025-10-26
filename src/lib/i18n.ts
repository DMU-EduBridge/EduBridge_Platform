/**
 * 국제화(i18n) 지원을 위한 기본 구조
 */

export type Locale = 'ko' | 'en';

export interface TranslationKeys {
  // 공통
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    loading: string;
    error: string;
    success: string;
  };

  // 문제 관련
  problems: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    difficulty: string;
    subject: string;
    type: string;
    points: string;
    correctAnswer: string;
    explanation: string;
    hints: string;
  };

  // 난이도
  difficulty: {
    easy: string;
    medium: string;
    hard: string;
    expert: string;
  };

  // 과목
  subjects: {
    korean: string;
    math: string;
    english: string;
    science: string;
    socialStudies: string;
    history: string;
    geography: string;
    physics: string;
    chemistry: string;
    biology: string;
    computerScience: string;
    art: string;
    music: string;
    physicalEducation: string;
    ethics: string;
    other: string;
  };

  // 문제 타입
  problemTypes: {
    multipleChoice: string;
    shortAnswer: string;
    essay: string;
    trueFalse: string;
    coding: string;
    math: string;
  };

  // 에러 메시지
  errors: {
    problemNotFound: string;
    problemCreationFailed: string;
    problemUpdateFailed: string;
    problemDeletionFailed: string;
    problemAttemptFailed: string;
    statsRetrievalFailed: string;
  };
}

export const translations: Record<Locale, TranslationKeys> = {
  ko: {
    common: {
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '수정',
      create: '생성',
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
    },
    problems: {
      title: '문제',
      create: '문제 생성',
      edit: '문제 수정',
      delete: '문제 삭제',
      difficulty: '난이도',
      subject: '과목',
      type: '유형',
      points: '점수',
      correctAnswer: '정답',
      explanation: '해설',
      hints: '힌트',
    },
    difficulty: {
      easy: '쉬움',
      medium: '보통',
      hard: '어려움',
      expert: '전문가',
    },
    subjects: {
      korean: '국어',
      math: '수학',
      english: '영어',
      science: '과학',
      socialStudies: '사회',
      history: '역사',
      geography: '지리',
      physics: '물리',
      chemistry: '화학',
      biology: '생물',
      computerScience: '컴퓨터과학',
      art: '미술',
      music: '음악',
      physicalEducation: '체육',
      ethics: '윤리',
      other: '기타',
    },
    problemTypes: {
      multipleChoice: '객관식',
      shortAnswer: '단답형',
      essay: '서술형',
      trueFalse: '참/거짓',
      coding: '코딩',
      math: '수학',
    },
    errors: {
      problemNotFound: '문제를 찾을 수 없습니다.',
      problemCreationFailed: '문제 생성에 실패했습니다.',
      problemUpdateFailed: '문제 수정에 실패했습니다.',
      problemDeletionFailed: '문제 삭제에 실패했습니다.',
      problemAttemptFailed: '답안 제출에 실패했습니다.',
      statsRetrievalFailed: '통계를 불러올 수 없습니다.',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    problems: {
      title: 'Problem',
      create: 'Create Problem',
      edit: 'Edit Problem',
      delete: 'Delete Problem',
      difficulty: 'Difficulty',
      subject: 'Subject',
      type: 'Type',
      points: 'Points',
      correctAnswer: 'Correct Answer',
      explanation: 'Explanation',
      hints: 'Hints',
    },
    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      expert: 'Expert',
    },
    subjects: {
      korean: 'Korean',
      math: 'Math',
      english: 'English',
      science: 'Science',
      socialStudies: 'Social Studies',
      history: 'History',
      geography: 'Geography',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
      computerScience: 'Computer Science',
      art: 'Art',
      music: 'Music',
      physicalEducation: 'Physical Education',
      ethics: 'Ethics',
      other: 'Other',
    },
    problemTypes: {
      multipleChoice: 'Multiple Choice',
      shortAnswer: 'Short Answer',
      essay: 'Essay',
      trueFalse: 'True/False',
      coding: 'Coding',
      math: 'Math',
    },
    errors: {
      problemNotFound: 'Problem not found.',
      problemCreationFailed: 'Failed to create problem.',
      problemUpdateFailed: 'Failed to update problem.',
      problemDeletionFailed: 'Failed to delete problem.',
      problemAttemptFailed: 'Failed to submit answer.',
      statsRetrievalFailed: 'Failed to retrieve statistics.',
    },
  },
};

/**
 * 번역 함수
 */
export function t(key: string, locale: Locale = 'ko'): string {
  const keys = key.split('.');
  let value: unknown = translations[locale];

  for (const k of keys) {
    if (typeof value === 'object' && value !== null && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * 현재 로케일을 가져오는 함수
 */
export function getCurrentLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale') as Locale;
    if (stored && ['ko', 'en'].includes(stored)) {
      return stored;
    }

    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'ko';
  }

  return 'ko';
}

/**
 * 로케일을 설정하는 함수
 */
export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }
}
