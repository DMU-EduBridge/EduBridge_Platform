# 🎓 EduBridge Platform

<div align="center">

![EduBridge Logo](https://img.shields.io/badge/EduBridge-AI%20Education%20Platform-blue?style=for-the-badge&logo=graduation-cap)

**AI 기반 통합 교육 플랫폼으로 교사와 학생을 연결하는 차세대 교육 솔루션**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

## 📖 프로젝트 개요

EduBridge는 **AI 기술을 활용한 통합 교육 플랫폼**입니다. 교사와 학생 간의 효율적인 학습 환경을 제공하며, 개인화된 학습 경험과 데이터 기반 인사이트를 통해 교육의 질을 향상시킵니다.

### 🎯 핵심 가치

- **Educational AI System**: 교과서 기반 AI 문제 생성 및 RAG 검색
- **Teacher Report System**: 학생 데이터 분석 및 리포트 생성
- **통합 대시보드**: AI 서버 모니터링 및 사용 통계
- **확장 가능한 아키텍처**: Next.js + Prisma + ChromaDB 구조

## ✨ 주요 기능

### 🤖 Educational AI System

- **교과서 업로드**: PDF 교과서 업로드 및 자동 청크 분할
- **AI 문제 생성**: 교과서 내용 기반 맞춤형 문제 자동 생성
- **RAG 검색**: 벡터 임베딩을 활용한 의미 기반 검색
- **컨텍스트 기반 학습**: 관련 내용을 찾아 학습 효과 향상

### 📊 Teacher Report System

- **학생 데이터 분석**: 성적, 출석률, 과제 제출률 종합 분석
- **AI 리포트 생성**: 학생별 학습 패턴 및 개선점 자동 생성
- **학급 현황 파악**: 전체 학급의 학습 수준 및 분포 분석
- **맞춤형 권장사항**: 개별 학생을 위한 학습 전략 제안

### 🖥️ 통합 대시보드

- **AI 서버 모니터링**: Educational AI, Teacher Report 서버 상태 실시간 확인
- **사용 통계**: API 사용량, 비용, 성능 지표 종합 관리
- **동기화 관리**: AI 서버와의 데이터 동기화 상태 및 기록
- **시스템 현황**: 전체 플랫폼의 건강 상태 및 성능 모니터링

### 👥 학생 관리

- **학생 프로필**: 개인정보, 학습 스타일, 관심사 관리
- **진행률 추적**: 문제별 완료 상태, 점수, 시도 횟수 기록
- **성과 분석**: 평균 점수, 완료율, 학습 시간 분석
- **개인화 설정**: 선호 난이도, 학습 스타일, 관심 과목 설정

### 📈 리포트 & 분석

- **학습 분석 리포트**: 개별 학생의 학습 패턴 및 성과 분석
- **클래스 리포트**: 전체 학생의 학습 현황 및 트렌드 분석
- **AI 인사이트**: 학습 데이터 기반 개선 권장사항 제공
- **진로 상담**: 학습 성과 기반 진로 및 대학 추천

### 🔐 인증 & 권한 관리

- **다중 인증**: 이메일/비밀번호, Google OAuth 지원
- **역할 기반 접근 제어**: 교사, 학생, 관리자 권한 분리
- **라우트 보호**: 미들웨어를 통한 페이지 접근 제어
- **세션 관리**: 안전한 사용자 세션 및 자동 로그아웃

### 📁 파일 관리

- **안전한 업로드**: 파일 크기, MIME 타입 검증
- **파일명 정규화**: 보안을 위한 파일명 정리
- **다양한 형식 지원**: 이미지, PDF, 문서 파일 업로드

## 🛠️ 기술 스택

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI, Lucide React
- **State Management**: React Query v5 (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

### Backend

- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: SQLite (개발) / PostgreSQL (프로덕션)
- **Vector Database**: ChromaDB (벡터 임베딩 저장 및 검색)
- **ORM**: Prisma 5.7
- **Authentication**: NextAuth.js
- **File Upload**: Next.js built-in API

### Development Tools

- **Build Tool**: Turbopack (개발)
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm

### AI & Analytics

- **AI Integration**: OpenAI, Anthropic, Google AI (확장 가능)
- **Vector Embeddings**: OpenAI text-embedding-ada-002
- **Semantic Search**: ChromaDB + 벡터 임베딩
- **Data Analysis**: Prisma + Custom analytics
- **Logging**: Custom logger with structured logging

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd EduBridge
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
# 환경변수 파일 생성
cp .env.example .env.local
```

`.env.local` 파일에서 다음 값들을 설정하세요:

```env
# NextAuth 설정 (필수)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters

# 데이터베이스 (필수)
DATABASE_URL="file:./dev.db"

# API 설정 (선택사항)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 파일 업로드 설정 (선택사항)
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# AI 서비스 (공통 API 키 - 선택사항)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# 로깅 레벨 (선택사항)
LOG_LEVEL=info
```

> ⚠️ **보안 주의사항**:
>
> - `.env.local` 파일은 절대 Git에 커밋하지 마세요
> - 프로덕션 환경에서는 강력한 비밀키를 사용하세요
> - API 키는 해당 서비스의 보안 정책을 따르세요

### 4. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate

# 시드 데이터 삽입 (선택사항)
npm run db:seed
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 6. 프로덕션 빌드

```bash
# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📚 문서

- [프로젝트 구조 문서](./docs/PROJECT_STRUCTURE.md) - 전체 프로젝트 구조 및 아키텍처
- [API 문서](./docs/API_DOCUMENTATION.md) - 모든 API 엔드포인트 상세 설명
- [개발 가이드](./docs/DEVELOPMENT_GUIDE.md) - 개발 환경 설정 및 개발 가이드
- [ERD 다이어그램](./docs/erd.svg) - 데이터베이스 관계도

## 📁 프로젝트 구조

```
EduBridge/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── 📁 (afterLogin)/             # 로그인 후 페이지 그룹
│   │   │   ├── 📁 dashboard/            # 대시보드
│   │   │   ├── 📁 problems/             # 문제 관리
│   │   │   ├── 📁 students/             # 학생 관리
│   │   │   ├── 📁 reports/              # 리포트
│   │   │   ├── 📁 profile/              # 프로필
│   │   │   └── 📄 layout.tsx            # 공통 레이아웃
│   │   ├── 📁 api/                      # API 라우트
│   │   │   ├── 📁 auth/                 # 인증 API
│   │   │   ├── 📁 problems/             # 문제 API
│   │   │   ├── 📁 students/             # 학생 API
│   │   │   ├── 📁 reports/              # 리포트 API
│   │   │   ├── 📁 learning-materials/   # 학습자료 API
│   │   │   ├── 📁 stats/                # 통계 API
│   │   │   └── 📁 upload/               # 파일 업로드 API
│   │   ├── 📁 login/                    # 로그인 페이지
│   │   │   ├── 📄 page.tsx              # 서버 컴포넌트
│   │   │   └── 📄 login-form.tsx        # 클라이언트 컴포넌트
│   │   ├── 📁 signup/                   # 회원가입 페이지
│   │   ├── 📁 demo/                     # 데모 페이지
│   │   ├── 📁 projects/                 # 프로젝트 페이지
│   │   ├── 📄 layout.tsx                # 루트 레이아웃
│   │   ├── 📄 page.tsx                  # 홈페이지
│   │   ├── 📄 providers.tsx             # React Query Provider
│   │   └── 📄 globals.css               # 전역 스타일
│   ├── 📁 components/                   # React 컴포넌트
│   │   ├── 📁 dashboard/                # 대시보드 컴포넌트
│   │   │   ├── 📄 layout.tsx           # 대시보드 레이아웃
│   │   │   ├── 📄 stats-cards.tsx      # 통계 카드
│   │   │   ├── 📄 recent-activity.tsx  # 최근 활동
│   │   │   └── 📄 quick-actions.tsx     # 빠른 액션
│   │   ├── 📁 landing/                  # 랜딩 페이지 컴포넌트
│   │   │   ├── 📄 hero.tsx              # 히어로 섹션
│   │   │   ├── 📄 features.tsx         # 기능 소개
│   │   │   ├── 📄 how-it-works.tsx     # 사용법
│   │   │   ├── 📄 stats.tsx            # 통계
│   │   │   └── 📄 cta.tsx              # CTA
│   │   ├── 📁 layout/                   # 레이아웃 컴포넌트
│   │   │   ├── 📄 header.tsx           # 헤더
│   │   │   └── 📄 footer.tsx           # 푸터
│   │   └── 📁 ui/                       # 재사용 가능한 UI 컴포넌트
│   │       ├── 📄 button.tsx            # 버튼
│   │       ├── 📄 input.tsx             # 입력 필드
│   │       ├── 📄 card.tsx              # 카드
│   │       ├── 📄 alert.tsx             # 알림
│   │       ├── 📄 badge.tsx             # 배지
│   │       ├── 📄 label.tsx             # 라벨
│   │       └── 📄 file-upload.tsx       # 파일 업로드
│   ├── 📁 lib/                          # 유틸리티 및 설정
│   │   ├── 📄 prisma.ts                 # Prisma 클라이언트
│   │   ├── 📄 auth.ts                   # NextAuth 설정
│   │   ├── 📄 api.ts                    # Axios 설정
│   │   ├── 📄 query-client.ts           # React Query 설정
│   │   ├── 📄 validation.ts             # Zod 유효성 검사
│   │   ├── 📄 utils.ts                  # 유틸리티 함수
│   │   ├── 📄 error-handler.ts          # 에러 핸들링
│   │   ├── 📄 env.ts                    # 환경변수 관리
│   │   └── 📄 api-services.ts           # API 서비스 통합
│   ├── 📁 services/                     # 비즈니스 로직 서비스
│   │   └── 📁 lms/                      # LMS 관련 서비스
│   │       ├── 📄 auth.ts               # 인증 서비스
│   │       ├── 📄 problems.ts           # 문제 서비스
│   │       ├── 📄 students.ts           # 학생 서비스
│   │       ├── 📄 reports.ts            # 리포트 서비스
│   │       ├── 📄 learning.ts           # 학습자료 서비스
│   │       └── 📄 index.ts              # 서비스 통합
│   ├── 📁 types/                        # TypeScript 타입 정의
│   │   ├── 📁 lms/                      # LMS 관련 타입
│   │   │   ├── 📄 user.ts               # 사용자 타입
│   │   │   ├── 📄 problem.ts            # 문제 타입
│   │   │   ├── 📄 student.ts            # 학생 타입
│   │   │   ├── 📄 report.ts             # 리포트 타입
│   │   │   └── 📄 index.ts              # 타입 통합
│   │   ├── 📄 api.ts                    # API 타입
│   │   ├── 📄 index.ts                  # 기본 타입
│   │   └── 📄 next-auth.d.ts            # NextAuth 타입 확장
│   ├── 📁 hooks/                        # 커스텀 React 훅
│   │   └── 📄 use-api.ts                # API 훅
│   └── 📄 middleware.ts                 # Next.js 미들웨어
├── 📁 prisma/                           # Prisma 설정
│   ├── 📄 schema.prisma                 # 데이터베이스 스키마
│   ├── 📄 seed.ts                       # 시드 데이터
│   ├── 📁 migrations/                   # 마이그레이션 파일
│   └── 📄 dev.db                        # SQLite 데이터베이스
├── 📁 public/                           # 정적 파일
├── 📄 package.json                       # 프로젝트 설정
├── 📄 next.config.js                    # Next.js 설정
├── 📄 tailwind.config.ts                # Tailwind CSS 설정
├── 📄 tsconfig.json                      # TypeScript 설정
├── 📄 .eslintrc.json                     # ESLint 설정
├── 📄 .prettierrc                        # Prettier 설정
└── 📄 README.md                          # 프로젝트 문서
```

## 🧩 백엔드 구조(아키텍처)

- 레이어드 아키텍처: Controller(API Route) → Service(비즈니스 로직) → Repository(DB 접근, Prisma) → DB
- DTO 기반 검증: zod 스키마로 요청/응답 검증 및 타입 일치 보장
- 공통 유틸: 표준 응답/에러/로깅/Request ID/페이징 헬퍼 제공

### 디렉터리 역할

- `src/app/api/**`: App Router API 라우트(컨트롤러). 파라미터 파싱, DTO 검증, 서비스 호출, 응답 처리만 담당
- `src/server/services/**`: 도메인 서비스. 권한/레이트리밋/트랜잭션/집계 등 비즈니스 로직
- `src/server/repositories/**`: Prisma 쿼리 캡슐화. findMany/findById/create/update/delete 등
- `src/server/dto/**`: zod 스키마(요청/응답). 일부는 OpenAPI components.schemas로 자동 노출
- `src/lib/utils/http.ts`: `okJson`, `getPagination`, `getParam`, `getSearchParams`
- `src/lib/utils/error-handler.ts`: `withErrorHandler`, 표준 에러 응답(요청 실패 시 `X-Request-Id` 포함), Prisma 에러 매핑(P2002/2003/2025 등)
- `src/lib/utils/request-context.ts`: `getRequestId`(성공/에러 응답 헤더 부착에 사용)
- `src/lib/utils/service-metrics.ts`: 서비스 경계 성능 로깅 프록시(호출 시간/에러 로깅)

### 요청 흐름

1. API Route(Controller): 파라미터/바디 파싱 → zod 검증 → Service 호출 → `okJson(.., request)`로 성공 응답(`X-Request-Id` 자동)
2. Service: 권한 확인, 레이트리밋, 트랜잭션, 도메인 규칙 처리(서비스 경계 로깅 적용)
3. Repository: Prisma로 DB 접근, N+1 방지 및 필요한 관계만 select/include

### 표준 컨벤션

- 에러 처리: `withErrorHandler`로 래핑, 에러 바디/헤더에 `requestId` 포함
- 로깅: `logger.info|warn|error` + 서비스 경계 로깅(`service-metrics`)
- 캐시: 읽기 GET에 한해 `Cache-Control` 명시, 민감 데이터 `no-store`
- 레이트리밋: 시도 생성 등 쓰기 엔드포인트에 도메인별 적용(전역 미들웨어 확장 가능)
- 보안 헤더: `middleware.ts` 전역 기본 적용, 일부 API에서 직접 헤더 세팅
- 런타임: 파일 IO(업로드/다운로드)는 Node 런타임 유지. 경량 GET은 필요 시 Edge 전환 가능

### OpenAPI(스웨거)

- 스펙: `GET /api/docs` (OpenAPI 3.0 JSON)
- UI: `GET /api/docs/ui` (Swagger UI)
- DTO 자동 반영: `@asteasolutions/zod-to-openapi`로 주요 zod 스키마를 components.schemas로 등록
- 태그 분류: Reports/Problems/Attempts/Solutions/Students/Materials/Upload/Alerts/Metrics/Health

### 인덱스/성능

- 주요 조회 최적화를 위해 복합 인덱스 추가
  - `analysis_reports (studentId, type, status, createdAt)`
  - `learning_materials (status, subject, createdAt)`

### 테스트/CI (권장)

- 서비스/레포 단위 테스트: Vitest/Jest + sqlite-in-memory
- CI: `lint`/`typecheck`/`test`/`prisma generate`/`build`

## 🗄️ 데이터베이스 스키마 (ERD)

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string name
        string role
        string avatar
        string bio
        string grade
        string status
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    UserPreferences {
        string id PK
        string userId FK
        string preferredDifficulty
        string learningStyle
        int studyTime
        string interests
        boolean emailNotifications
        boolean pushNotifications
        boolean weeklyReport
    }

    LearningMaterial {
        string id PK
        string title
        string description
        string content
        string subject
        string difficulty
        int estimatedTime
        string files
        string status
        boolean isActive
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    Problem {
        string id PK
        string title
        string description
        string content
        string type
        string difficulty
        string subject
        string options
        string correctAnswer
        string explanation
        string hints
        string tags
        int points
        int timeLimit
        boolean isActive
        boolean isAIGenerated
        string aiGenerationId FK
        float qualityScore
        string reviewStatus
        string reviewedBy FK
        datetime reviewedAt
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    StudentProgress {
        string id PK
        string studentId FK
        string problemId FK
        string status
        int score
        int timeSpent
        int attempts
        datetime createdAt
        datetime updatedAt
    }

    AnalysisReport {
        string id PK
        string studentId FK
        string type
        string title
        string period
        string insights
        string recommendations
        string strengths
        string weaknesses
        string status
        string aiGenerationId FK
        datetime createdAt
        datetime deletedAt
    }

    CareerCounseling {
        string id PK
        string studentId FK
        string type
        string title
        string content
        string careerSuggestions
        string universityRecommendations
        string skillGaps
        string status
        string aiGenerationId FK
        datetime createdAt
        datetime deletedAt
    }

    LearningMaterialProblem {
        string id PK
        string learningMaterialId FK
        string problemId FK
        datetime createdAt
    }

    AIModel {
        string id PK
        string name
        string version
        string provider
        boolean isActive
        datetime createdAt
    }

    AIGeneration {
        string id PK
        string modelId FK
        string prompt
        string response
        int tokensUsed
        float cost
        int duration
        datetime createdAt
    }

    ReportInsight {
        string id PK
        string reportId FK
        string category
        string content
        string priority
        datetime createdAt
    }

    ReportRecommendation {
        string id PK
        string reportId FK
        string type
        string content
        string priority
        datetime createdAt
    }

    %% Relationships
    User ||--o| UserPreferences : "has"
    User ||--o{ StudentProgress : "makes"
    User ||--o{ AnalysisReport : "generates"
    User ||--o{ CareerCounseling : "receives"
    User ||--o{ Problem : "reviews"

    Problem ||--o{ StudentProgress : "tracked_in"
    Problem ||--o{ LearningMaterialProblem : "linked_to"
    Problem }o--o| AIGeneration : "generated_by"

    LearningMaterial ||--o{ LearningMaterialProblem : "contains"

    AnalysisReport ||--o{ ReportInsight : "has"
    AnalysisReport ||--o{ ReportRecommendation : "has"
    AnalysisReport }o--o| AIGeneration : "generated_by"

    CareerCounseling }o--o| AIGeneration : "generated_by"

    AIModel ||--o{ AIGeneration : "creates"
```

### 🏗️ 스키마 주요 특징

- **AI 추적**: 모든 AI 생성 콘텐츠는 `AIGeneration` 테이블을 통해 추적
- **소프트 삭제**: 중요한 데이터는 `deletedAt` 필드로 소프트 삭제 지원
- **중복 방지**: `StudentProgress`에서 학생-문제 조합의 중복 방지
- **정규화**: 리포트의 인사이트와 권장사항을 별도 테이블로 분리
- **관계 최적화**: 학습자료와 문제 간 다대다 관계 지원
- **성능 최적화**: 인덱스 및 외래키 최적화로 쿼리 성능 향상

## 🎮 사용자 시나리오

### 👨‍🏫 교사 사용 시나리오

1. **로그인** → 대시보드에서 전체 학습 현황 확인
2. **문제 생성** → 과목별, 난이도별 문제 생성 및 관리
3. **학생 관리** → 개별 학생의 진행률 및 성과 모니터링
4. **학습자료 업로드** → PDF, 이미지 등 다양한 형태의 자료 제공
5. **리포트 생성** → AI 기반 학습 분석 리포트 생성
6. **피드백 제공** → 학생별 맞춤형 학습 가이드 제공

### 👨‍🎓 학생 사용 시나리오

1. **로그인** → 개인화된 학습 대시보드 접근
2. **문제 풀이** → AI 추천 문제 풀이 및 실시간 피드백
3. **학습자료 확인** → 교사가 제공한 자료 학습
4. **진행률 확인** → 개인 학습 현황 및 성과 확인
5. **약점 분석** → AI 분석을 통한 개선점 파악
6. **진로 상담** → 학습 성과 기반 진로 가이드 확인

## 🛠️ 개발 스크립트

### 기본 명령어

```bash
npm run dev              # 개발 서버 실행 (Turbopack 사용)
npm run build            # 프로덕션 빌드
npm start                # 프로덕션 서버 실행
```

### 코드 품질 관리

```bash
npm run lint             # ESLint 검사
npm run lint:fix         # ESLint 자동 수정
npm run format           # Prettier 포맷팅
npm run format:check     # 포맷팅 검사
npm run type-check       # TypeScript 타입 검사
```

### 데이터베이스 관리

```bash
npm run db:generate      # Prisma 클라이언트 생성
npm run db:migrate       # 데이터베이스 마이그레이션
npm run db:deploy        # 프로덕션 마이그레이션
npm run db:seed          # 시드 데이터 삽입
npm run db:reset         # 데이터베이스 리셋 + 시드
npm run db:studio        # Prisma Studio 실행
```

### 분석 및 디버깅

```bash
npm run analyze          # 번들 분석 (webpack-bundle-analyzer)
```

## 🔒 보안 및 환경 관리

### 환경변수 보안

- **`.env.local` 파일**: 실제 환경변수 값 저장 (Git에 커밋 금지)
- **`.env.example` 파일**: 환경변수 템플릿 제공 (Git에 커밋)
- **Zod 검증**: 런타임 환경변수 유효성 검사
- **민감한 정보**: API 키, 비밀키는 예시 값만 README에 포함

### 파일 업로드 보안

- 파일 크기 제한 (기본 10MB)
- MIME 타입 검증
- 파일명 정규화로 보안 강화

### 데이터베이스 보안

- Prisma를 통한 SQL Injection 방지
- 소프트 삭제로 데이터 복구 가능
- 역할 기반 접근 제어

### 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 프로덕션 환경에서 강력한 비밀키 사용
- [ ] API 키는 해당 서비스의 보안 정책 준수
- [ ] 정기적인 의존성 업데이트 및 보안 패치 적용

## 🚀 배포 가이드

### 프로덕션 환경 설정

1. **환경변수 설정**

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret-key"
```

2. **데이터베이스 마이그레이션**

```bash
npm run db:deploy
```

3. **빌드 및 배포**

```bash
npm run build
npm start
```

### 권장 배포 플랫폼

- **Vercel**: Next.js 최적화, 자동 배포
- **Railway**: 데이터베이스 포함 풀스택 배포
- **AWS**: 확장성과 안정성
- **Docker**: 컨테이너 기반 배포

## 📊 성능 최적화

### 프론트엔드 최적화

- **서버 컴포넌트**: 초기 로딩 성능 향상
- **이미지 최적화**: WebP, AVIF 포맷 지원
- **번들 최적화**: 패키지 임포트 최적화
- **캐싱 전략**: React Query를 통한 스마트 캐싱

### 백엔드 최적화

- **데이터베이스 인덱스**: 쿼리 성능 최적화
- **연결 풀**: Prisma 클라이언트 최적화
- **에러 핸들링**: 통합 에러 처리 시스템

## 🔮 향후 계획

### 단기 계획 (1-3개월)

- [ ] AI 문제 생성 기능 구현
- [ ] 실시간 채팅 시스템
- [ ] 모바일 앱 개발
- [ ] 다국어 지원

### 중기 계획 (3-6개월)

- [ ] 고급 분석 대시보드
- [ ] 게임화 요소 추가
- [ ] 부모 모니터링 기능
- [ ] API 문서화

### 장기 계획 (6개월+)

- [ ] 머신러닝 기반 개인화
- [ ] VR/AR 학습 콘텐츠
- [ ] 글로벌 확장
- [ ] 엔터프라이즈 기능

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. **Fork** 저장소
2. **Feature 브랜치** 생성 (`git checkout -b feature/AmazingFeature`)
3. **커밋** (`git commit -m 'Add some AmazingFeature'`)
4. **푸시** (`git push origin feature/AmazingFeature`)
5. **Pull Request** 생성

### 개발 가이드라인

- TypeScript strict mode 사용
- ESLint 규칙 준수
- Prettier 포맷팅 적용
- 의미있는 커밋 메시지 작성
- 테스트 코드 작성 권장

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의 및 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/your-repo/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **이메일**: support@edubridge.com

---

<div align="center">

**EduBridge Platform** - AI로 교육의 미래를 만들어갑니다 🚀

</div>
