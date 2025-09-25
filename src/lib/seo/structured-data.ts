export interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo: string;
  contactPoint: {
    '@type': string;
    telephone: string;
    contactType: string;
    email: string;
    availableLanguage: string[];
  };
  address: {
    '@type': string;
    addressCountry: string;
    addressLocality: string;
  };
  sameAs: string[];
}

export interface WebSiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
  publisher: {
    '@type': string;
    name: string;
  };
}

export interface EducationalOrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo: string;
  educationalCredentialAwarded: string;
  hasCredential: string[];
  offers: {
    '@type': string;
    name: string;
    description: string;
    category: string;
    educationalLevel: string;
    teaches: string[];
  }[];
}

export interface CourseSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  provider: {
    '@type': string;
    name: string;
    url: string;
  };
  educationalLevel: string;
  teaches: string[];
  courseMode: string;
  isAccessibleForFree: boolean;
  inLanguage: string;
  hasCourseInstance: {
    '@type': string;
    courseMode: string;
    instructor: {
      '@type': string;
      name: string;
    };
  }[];
}

export interface ProblemSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  educationalLevel: string;
  learningResourceType: string;
  teaches: string[];
  difficulty: string;
  timeRequired: string;
  inLanguage: string;
  author: {
    '@type': string;
    name: string;
  };
}

// 기본 조직 스키마
export const getOrganizationSchema = (): OrganizationSchema => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'EduBridge',
  description: 'AI 기반 교육 플랫폼으로 선생님과 학생을 연결하는 통합 교육 솔루션',
  url: 'https://edubridge.com',
  logo: 'https://edubridge.com/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+82-2-1234-5678',
    contactType: 'Customer Service',
    email: 'support@edubridge.com',
    availableLanguage: ['Korean', 'English'],
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'KR',
    addressLocality: 'Seoul',
  },
  sameAs: [
    'https://facebook.com/edubridge',
    'https://twitter.com/edubridge',
    'https://linkedin.com/company/edubridge',
  ],
});

// 웹사이트 스키마
export const getWebSiteSchema = (): WebSiteSchema => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'EduBridge AI Platform',
  description: 'AI 기반 교육 플랫폼으로 선생님과 학생을 연결하는 통합 교육 솔루션',
  url: 'https://edubridge.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://edubridge.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'EduBridge',
  },
});

// 교육 조직 스키마
export const getEducationalOrganizationSchema = (): EducationalOrganizationSchema => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'EduBridge',
  description: 'AI 기반 개인화 학습 플랫폼',
  url: 'https://edubridge.com',
  logo: 'https://edubridge.com/logo.png',
  educationalCredentialAwarded: '학습 수료증',
  hasCredential: ['AI 기반 학습 인증', '개인화 교육 수료'],
  offers: [
    {
      '@type': 'Course',
      name: '수학 기초',
      description: 'AI가 생성하는 맞춤형 수학 문제',
      category: '수학',
      educationalLevel: '초등학교',
      teaches: ['기본 연산', '분수', '소수'],
    },
    {
      '@type': 'Course',
      name: '영어 기초',
      description: 'AI가 생성하는 맞춤형 영어 문제',
      category: '영어',
      educationalLevel: '중학교',
      teaches: ['문법', '어휘', '독해'],
    },
  ],
});

// 코스 스키마 생성 함수
export const getCourseSchema = (courseData: {
  name: string;
  description: string;
  level: string;
  subjects: string[];
  instructor?: string;
}): CourseSchema => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: courseData.name,
  description: courseData.description,
  provider: {
    '@type': 'EducationalOrganization',
    name: 'EduBridge',
    url: 'https://edubridge.com',
  },
  educationalLevel: courseData.level,
  teaches: courseData.subjects,
  courseMode: 'online',
  isAccessibleForFree: false,
  inLanguage: 'ko',
  hasCourseInstance: [
    {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: {
        '@type': 'Person',
        name: courseData.instructor || 'AI 튜터',
      },
    },
  ],
});

// 문제 스키마 생성 함수
export const getProblemSchema = (problemData: {
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  estimatedTime: string;
  author?: string;
}): ProblemSchema => ({
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: problemData.title,
  description: problemData.description,
  educationalLevel: '초중고',
  learningResourceType: 'Exercise',
  teaches: [problemData.subject],
  difficulty: problemData.difficulty,
  timeRequired: problemData.estimatedTime,
  inLanguage: 'ko',
  author: {
    '@type': 'Person',
    name: problemData.author || 'EduBridge AI',
  },
});

// JSON-LD 스크립트 태그 생성 헬퍼
export const createJsonLdScript = (schema: any) => {
  return {
    __html: JSON.stringify(schema),
  };
};
