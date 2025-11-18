# 🎓 EduBridge Platform

<div align="center">

![EduBridge Logo](https://img.shields.io/badge/EduBridge-AI%20Education%20Platform-blue?style=for-the-badge&logo=graduation-cap)

**AI 기반 교육 플랫폼으로 문제 생성, 학습 분석, 리포트 자동화를 제공하는 차세대 교육 솔루션**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

## 📖 프로젝트 개요

EduBridge는 **AI 기술을 활용한 교육 플랫폼**입니다. 교사와 학생 간의 효율적인 학습 환경을 제공하며, AI 기반 문제 생성, 실시간 학습 로그 수집, 자동화된 리포트 생성을 통해 교육의 질을 향상시킵니다.

### 🎯 시연 핵심 기능

1. **AI 문제 생성** - 교과서 기반 자동 문제 생성 및 벡터 검색
2. **문제 풀이 및 로그 수집** - 학습 과정 실시간 추적 및 데이터 수집
3. **리포트 생성 및 조회** - AI 기반 학습 분석 리포트 자동 생성
4. **챗봇 학습 도우미** - 실시간 AI 학습 지원

## 📚 문서

- **[시연 가이드](./docs/DEMO_GUIDE.md)** - 완전한 시연 시나리오 및 사용 가이드
- **[프로젝트 현황](./docs/PROJECT_STATUS.md)** - 현재 개발 상태 및 완성도
- **[개발 가이드](./docs/DEVELOPMENT_GUIDE.md)** - 개발 환경 설정 및 가이드
- **[API 문서](./docs/API_DOCUMENTATION.md)** - API 엔드포인트 상세 설명
- **[프로젝트 구조](./docs/PROJECT_STRUCTURE.md)** - 코드 구조 및 아키텍처
- **[라우팅 구조](./docs/ROUTING.md)** - 페이지 라우팅 및 네비게이션

## ✨ 주요 기능

### 🤖 AI 문제 생성

- **교과서 기반 생성**: PDF 교과서 업로드 및 자동 청크 분할
- **AI 자동 생성**: GPT-4를 활용한 맞춤형 문제 자동 생성
- **벡터 검색 (RAG)**: 관련 내용을 찾아 문맥에 맞는 문제 생성
- **다양한 난이도**: 쉬움, 보통, 어려움 자동 조절

### � 문제 풀이 및 로그 수집

- **실시간 추적**: 문제 풀이 과정 실시간 모니터링
- **상세 로그 수집**: 소요 시간, 정답률, 시도 횟수 기록
- **진행 상황 저장**: 언제든 이어서 학습 가능
- **오답 재도전**: 틀린 문제만 모아서 다시 풀기

### 📊 리포트 생성 및 조회

- **AI 분석**: 학습 로그 기반 자동 분석
- **학생별 리포트**: 개인 맞춤형 학습 분석
- **반별 리포트**: 전체 학급 현황 파악
- **약점 분석**: 낮은 정답률 문제 및 개선 방안 제시
- **시각화**: 차트와 그래프로 직관적 표현

### � 챗봇 학습 도우미

- **실시간 질의응답**: AI 기반 즉각 답변
- **학습 자료 기반**: 교과서 내용 기반 정확한 정보
- **대화 이력 저장**: 과거 대화 조회 가능
- **멀티 세션 지원**: 여러 주제별 대화 관리

### ⚡ 성능 최적화 (NEW!)

- **이미지 최적화**: Next.js Image 컴포넌트, WebP/AVIF 지원, 지연 로딩
- **코드 분할**: 동적 임포트를 통한 페이지별 코드 분할
- **캐싱 전략**: React Query 기반 API 응답 캐싱, Redis 지원
- **데이터베이스 최적화**: 연결 풀링, 쿼리 최적화, 인덱싱, 배치 작업
- **성능 모니터링**: Web Vitals 추적, 실시간 성능 대시보드
- **쿼리 최적화**: 페이지네이션, WHERE 절, 관계 로딩 최적화 유틸리티
- **N+1 문제 해결**: 효율적인 데이터 로딩 및 관계 최적화

### 👥 클래스 관리 (NEW!)

- **클래스 생성**: 교사가 클래스를 생성하고 학생들을 초대
- **멤버 관리**: 클래스 멤버 추가/제거, 역할 관리
- **과제 배정**: 클래스별 문제 및 학습자료 배정
- **진도 추적**: 클래스 전체 및 개별 학생 진도 모니터링
- **통계 분석**: 클래스별 성과 분석 및 리포트 생성

### 👨‍🎓 학생 관리

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
- **트랜잭션 관리**: 데이터 일관성을 위한 트랜잭션 지원
- **에러 처리**: 통합 에러 처리 시스템 및 커스텀 에러 클래스

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
- **Caching**: Redis (선택사항)
- **Architecture**: Service Layer Pattern (DTO/Repository 제거)
- **Validation**: Zod 스키마 기반 런타임 검증

### Development Tools

- **Build Tool**: Turbopack (개발)
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm

### Analytics

- **AI Integration**: OpenAI, Anthropic, Google AI (확장 가능)
- **Vector Embeddings**: OpenAI text-embedding-ada-002
- **Semantic Search**: ChromaDB + 벡터 임베딩
- **Data Analysis**: Prisma + Custom analytics
- **Logging**: Custom logger with structured logging

### Performance & Monitoring

- **Web Vitals**: LCP, FID, CLS, FCP, TTFB 실시간 추적
- **Resource Monitoring**: 메모리 사용량, 리소스 로딩 시간
- **Performance Alerts**: 성능 임계값 초과 시 알림
- **Caching**: React Query + Redis 다층 캐싱
- **Image Optimization**: Next.js Image + WebP/AVIF 자동 변환

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상
- **Git**: 최신 버전

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/EduBridge.git
cd EduBridge
```

> **참고**: 실제 저장소 URL로 변경하세요.

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
# 환경변수 파일 생성
cp env.local.example .env.local
```

`.env.local` 파일에서 다음 값들을 설정하세요:

```env
# NextAuth 설정 (필수)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-for-development

# 데이터베이스 (PostgreSQL - Neon 등 무료 플랜 권장)
DATABASE_URL="postgres://username:password@host/dbname?sslmode=require"

# ChromaDB 설정 (선택사항 - 벡터 검색 기능용)
CHROMA_URL=http://localhost:8000

# Redis 설정 (선택사항 - 캐싱용)
REDIS_URL=redis://localhost:6379

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API (선택사항 - AI 기능용)
OPENAI_API_KEY=your-openai-api-key

# 개발용 비밀번호
DEV_TEST_PASSWORD=password123

# 로깅 레벨
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

# 시드 데이터 삽입 (테스트용 계정 및 데이터 포함)
npm run db:seed
```

> **중요**: 시드 데이터에는 테스트용 계정들이 포함되어 있으므로 반드시 실행하세요.

### 5. 외부 서비스 실행 (선택사항)

#### ChromaDB (벡터 검색 기능용)

```bash
docker run -d --name chromadb -p 8000:8000 chromadb/chroma:latest
```

#### Redis (캐싱 기능용)

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) (또는 3001)을 열어 확인하세요.

### 7. 로그인 테스트

다음 계정들로 로그인하여 기능을 테스트할 수 있습니다:

#### 관리자 계정

- **이메일**: `admin@example.com`
- **비밀번호**: `password123` (소셜 전용 계정)

#### 교사 계정들

- **수학 교사**: `math_teacher1@example.com` / `password123` (소셜 전용 계정)
- **과학 교사**: `science_teacher@example.com` / `password123` (소셜 전용 계정)
- **영어 교사**: `english_teacher@example.com` / `password123` (소셜 전용 계정)

#### 학생 계정들

- **학생 1**: `student1@example.com` / `password123`
- **학생 2**: `student2@example.com` / `password123`
- **학생 3**: `student3@example.com` / `password123`
- **최미나**: `choi_mina@example.com` / `password123`
- **정현**: `jung_hyeon@example.com` / `password123`

> **참고**: 교사 계정은 소셜 전용 계정이므로 개발 환경에서는 `DEV_TEST_PASSWORD`로 로그인할 수 있습니다.

### 8. 프로덕션 빌드

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

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌 문제

```bash
# 포트 3000이 사용 중인 경우
npm run dev -- -p 3001
```

#### 2. 데이터베이스 연결 문제

```bash
# 데이터베이스 리셋
npm run db:reset

# Prisma 클라이언트 재생성
npm run db:generate
```

#### 3. 캐시 문제

```bash
# 캐시 정리
npm run clean

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 4. 타입 에러

```bash
# TypeScript 타입 체크
npm run type-check

# 타입 정의 업데이트
npm run db:generate
```

### 로그 확인

개발 서버 실행 시 터미널에서 다음 로그들을 확인할 수 있습니다:

- `✅ 시드 데이터 생성 완료` - 데이터베이스 초기화 성공
- `🚀 서버가 포트 3000에서 실행 중` - 개발 서버 시작
- `📊 Prisma Studio: http://localhost:5555` - 데이터베이스 GUI 접근

## 📚 문서

- [프로젝트 구조 문서](./docs/PROJECT_STRUCTURE.md) - 전체 프로젝트 구조 및 아키텍처
- [API 문서](./docs/API_DOCUMENTATION.md) - 모든 API 엔드포인트 상세 설명
- [개발 가이드](./docs/DEVELOPMENT_GUIDE.md) - 개발 환경 설정 및 개발 가이드
- [ERD 다이어그램](./docs/erd.svg) - 데이터베이스 관계도

## 🛠️ 개발 도구 및 스크립트

### 테스트 데이터 생성

```bash
# 성능 테스트 데이터 생성
npm run test-data:performance

# 벡터 검색 테스트 데이터 생성
npm run test-data:vector

# 스트레스 테스트 데이터 생성
npm run test-data:stress

# 더미 데이터 생성 (사용자, 문제, 교과서 등)
npm run dummy-data

# 고아 데이터 정리
npm run db:cleanup-orphans
```

### 데이터베이스 관리

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate

# 데이터베이스 리셋 (개발 환경) - 모든 데이터 삭제 후 시드 재삽입
npm run db:reset

# 시드 데이터 삽입
npm run db:seed

# Prisma Studio 실행 (GUI로 데이터베이스 관리)
npm run db:studio

# 데이터베이스 최적화 (인덱스 생성)
npm run db:optimize:indexes

# 데이터베이스 성능 분석
npm run db:optimize:analyze

# 모든 최적화 작업 실행
npm run db:optimize:all
```

### 서비스 관리

```bash
# 모든 서비스 상태 확인
docker ps

# ChromaDB 실행
docker run -d --name chromadb -p 8000:8000 chromadb/chroma:latest

# Redis 실행
docker run -d --name redis -p 6379:6379 redis:7-alpine

# 서비스 중지
docker stop chromadb redis

# 서비스 제거
docker rm chromadb redis
```

## 📁 프로젝트 구조

```
EduBridge/
├── 📁 docs/                          # 문서
│   ├── erd.svg                       # 데이터베이스 ERD
│   ├── README.md                     # 프로젝트 설명
│   └── PROJECT_STRUCTURE.md          # 프로젝트 구조 문서
├── 📁 prisma/                        # 데이터베이스
│   ├── schema.prisma                 # Prisma 스키마
│   ├── seed.ts                       # 시드 데이터
│   ├── dev.db                        # SQLite 데이터베이스
│   └── migrations/                   # 마이그레이션 파일
├── 📁 scripts/                       # 유틸리티 스크립트
│   ├── generate-test-data.ts         # 테스트 데이터 생성
│   ├── dummy-data-generator.ts       # 더미 데이터 생성
│   └── cleanup-orphan-attempts.ts   # 고아 데이터 정리
├── 📁 deployment/                    # 배포 관련 파일
│   └── nginx.conf                    # Nginx 설정
├── 📁 public/                        # 정적 파일
│   └── uploads/                      # 업로드된 파일
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
│   └── 📄 dev.db                        # (개발 전용) SQLite DB - 프로덕션은 Postgres 사용
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

- **서비스 레이어 아키텍처**: Controller(API Route) → Service(비즈니스 로직) → Prisma ORM → DB
- **DTO/Repository 패턴 제거**: 불필요한 중간 계층 제거로 성능 향상 및 코드 단순화
- **도메인별 서비스 구조**: 클래스, 문제, 사용자 등 도메인별 폴더 구조로 재구성
- **Zod 기반 검증**: 런타임 타입 검증 및 스키마 기반 API 문서화
- **통합 에러 처리**: 커스텀 에러 클래스 및 표준화된 에러 응답
- **트랜잭션 관리**: 데이터 일관성을 위한 트랜잭션 지원

### 디렉터리 역할

- `src/app/api/**`: App Router API 라우트(컨트롤러). 파라미터 파싱, Zod 검증, 서비스 호출, 응답 처리만 담당
- `src/server/services/**`: 도메인별 서비스 폴더 구조
  - `class/`: 클래스 관리 (CRUD, 멤버 관리, 과제 배정)
  - `problem/`: 문제 관리 (CRUD, 검토, 통계, 검색)
  - `user/`: 사용자 관리 (인증, 프로필, 권한)
- `src/lib/schemas/**`: Zod 스키마(요청/응답). OpenAPI components.schemas로 자동 노출
- `src/lib/api-response.ts`: 표준화된 API 응답 구조 및 에러 코드
- `src/lib/errors/`: 커스텀 에러 클래스 및 통합 에러 처리
- `src/lib/transactions/`: 트랜잭션 관리 유틸리티
- `src/lib/validation/`: Zod 기반 검증 유틸리티

### 성능 최적화 모듈

- `src/lib/performance/query-optimizer.ts`: 쿼리 최적화 유틸리티 (페이지네이션, WHERE 절, 관계 로딩)
- `src/lib/performance/web-vitals.ts`: Web Vitals 추적 및 성능 측정
- `src/lib/cache/cache-manager.ts`: Redis 기반 캐싱 시스템
- `scripts/optimize-database.ts`: 데이터베이스 최적화 스크립트 (인덱스 생성, 성능 분석)
- `src/components/ui/optimized-image.tsx`: 최적화된 이미지 컴포넌트 (WebP/AVIF 지원)
- `src/components/dashboard/performance-dashboard.tsx`: 실시간 성능 대시보드

### 벡터 검색 모듈

- `src/lib/vector/chromadb.ts`: ChromaDB 클라이언트 및 컬렉션 관리
- `src/lib/vector/embedding-service.ts`: 임베딩 생성 및 의미 기반 검색

### 요청 흐름

1. API Route(Controller): 파라미터/바디 파싱 → Zod 검증 → Service 호출 → 표준화된 응답 반환
2. Service: 권한 확인, 트랜잭션, 도메인 규칙 처리, 쿼리 최적화 적용
3. Prisma ORM: 직접 DB 접근, N+1 방지 및 필요한 관계만 select/include

### 표준 컨벤션

- 에러 처리: 커스텀 에러 클래스 사용, 표준화된 에러 응답 구조
- 로깅: 구조화된 로깅 시스템, 서비스 경계 성능 측정
- 캐싱: Redis 기반 다층 캐싱, 읽기 GET에 캐시 적용
- 트랜잭션: 데이터 일관성을 위한 트랜잭션 관리
- 보안 헤더: `middleware.ts` 전역 기본 적용
- 타입 안정성: `exactOptionalPropertyTypes: true` 설정으로 엄격한 타입 검사

### OpenAPI(스웨거)

- 스펙: `GET /api/docs` (OpenAPI 3.0 JSON)
- UI: `GET /api/docs/ui` (Swagger UI)
- Zod 스키마 자동 반영: 주요 Zod 스키마를 components.schemas로 등록
- 태그 분류: Classes/Problems/Students/Materials/Reports/Analytics/Health 등

### 인덱스/성능

- 주요 조회 최적화를 위해 복합 인덱스 추가
  - `analysis_reports (studentId, type, status, createdAt)`
  - `learning_materials (status, subject, createdAt)`
  - `classes (teacherId, status, createdAt)`
  - `class_members (classId, userId, role)`
  - `student_progress (studentId, problemId, status)`
- 쿼리 최적화 유틸리티로 N+1 문제 해결
- Redis 캐싱으로 반복 쿼리 성능 향상

### 테스트/CI (권장)

- 서비스/레포 단위 테스트: Vitest/Jest + sqlite-in-memory
- CI: `lint`/`typecheck`/`test`/`prisma generate`/`build`

## 🗄️ 데이터베이스 스키마 (ERD)

![Database ERD](./docs/erd.svg)

<details>
<summary>📊 상세 ERD 다이어그램 (Mermaid)</summary>

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string name
        string role
        string avatar
        string bio
        string gradeLevel
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

    Class {
        string id PK
        string name
        string description
        string subject
        string schoolYear
        string teacherId FK
        string status
        datetime createdAt
        datetime updatedAt
    }

    ClassMember {
        string id PK
        string classId FK
        string userId FK
        string role
        datetime joinedAt
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

    AIServerStatus {
        string id PK
        string serverName
        string serverUrl
        string status
        int responseTimeMs
        string version
        string errorMessage
        json services
        datetime lastChecked
        datetime createdAt
    }

    AIServerSync {
        string id PK
        string serverName
        string syncType
        string status
        datetime startTime
        datetime endTime
        int durationMs
        int recordsProcessed
        int recordsSynced
        string errors
        json metadata
        string userId FK
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
    User ||--o{ Class : "teaches"
    User ||--o{ ClassMember : "belongs_to"
    User ||--o{ AIServerSync : "initiates"

    Problem ||--o{ StudentProgress : "tracked_in"
    Problem ||--o{ LearningMaterialProblem : "linked_to"
    Problem }o--o| AIGeneration : "generated_by"

    LearningMaterial ||--o{ LearningMaterialProblem : "contains"

    AnalysisReport ||--o{ ReportInsight : "has"
    AnalysisReport ||--o{ ReportRecommendation : "has"
    AnalysisReport }o--o| AIGeneration : "generated_by"

    CareerCounseling }o--o| AIGeneration : "generated_by"

    AIModel ||--o{ AIGeneration : "creates"

    Class ||--o{ ClassMember : "has"
    Class ||--o{ ProblemAssignment : "assigns"

    TeacherReport ||--o{ ReportInsight : "contains"
    TeacherReport ||--o{ ReportRecommendation : "contains"
    TeacherReport ||--o{ ReportAnalysis : "analyzes"
    TeacherReport ||--o{ StudentData : "includes"
    TeacherReport ||--o{ ClassInfo : "summarizes"
```

</details>

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
npm run precommit        # 커밋 전 검사 (lint + format + type-check)
```

### 데이터베이스 관리

```bash
npm run db:generate      # Prisma 클라이언트 생성
npm run db:migrate       # 데이터베이스 마이그레이션
npm run db:deploy        # 프로덕션 마이그레이션
npm run db:seed          # 시드 데이터 삽입
npm run db:reset         # 데이터베이스 리셋 + 시드
npm run db:studio        # Prisma Studio 실행
npm run db:cleanup-orphans # 고아 데이터 정리
```

### 테스트

```bash
npm run test             # Jest 테스트 실행
npm run test:watch       # 테스트 감시 모드
npm run test:coverage    # 커버리지 포함 테스트
npm run test:ci          # CI 환경용 테스트
```

### 분석 및 디버깅

```bash
npm run analyze          # 번들 분석 (webpack-bundle-analyzer)
npm run clean            # 캐시 정리 (.next, node_modules/.cache)
```

## 🔒 보안 및 환경 관리

### 환경변수 보안

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

### 무료 배포 가이드 (Vercel + Neon)

1. **Neon에서 Postgres 생성** → 연결 문자열 복사 (`sslmode=require` 권장)
2. **Vercel 프로젝트 Import** (GitHub 연결)
3. **Vercel 환경변수 설정**

```env
DATABASE_URL="postgres://username:password@host/dbname?sslmode=require"
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
NEXTAUTH_SECRET="set-a-strong-secret"
DEV_TEST_PASSWORD="password123"
```

4. **마이그레이션/시드**
   - 로컬에서 Neon DB 대상으로 실행:

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

5. **배포 트리거** (Vercel → Deploy)

> 업로드/벡터검색이 필요 없으면 관련 기능을 임시 비활성화해도 됩니다.

### 프로덕션 환경 설정 (자체 서버 배포 시)

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

- [x] AI 문제 생성 기능 구현
- [x] 학습자료-문제 연결 시스템
- [x] 클래스 관리 시스템
- [x] 진도 추적 및 분석
- [ ] 실시간 채팅 시스템
- [ ] 모바일 앱 개발
- [ ] 다국어 지원

### 중기 계획 (3-6개월)

- [ ] 고급 분석 대시보드
- [ ] 게임화 요소 추가
- [ ] 부모 모니터링 기능
- [ ] API 문서화
- [ ] 드래그 앤 드롭 UI 개선

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

<div align="center">

**EduBridge Platform** - AI로 교육의 미래를 만들어갑니다 🚀

</div>
