# EduBridge Platform - 프로젝트 구조 문서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처 구조](#아키텍처-구조)
3. [디렉토리 구조](#디렉토리-구조)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [API 엔드포인트](#api-엔드포인트)
6. [AI 서버 연동](#ai-서버-연동)
7. [프론트엔드 구조](#프론트엔드-구조)
8. [개발 환경 설정](#개발-환경-설정)

## 🎯 프로젝트 개요

**EduBridge Platform**은 교육용 AI 시스템을 통합한 Next.js 기반의 교육 플랫폼입니다.

### 주요 기능

- **Educational AI System**: 교과서 기반 AI 문제 생성 및 RAG 검색
- **Teacher Report System**: 학생 데이터 분석 및 리포트 생성
- **통합 대시보드**: AI 서버 모니터링 및 사용 통계
- **사용자 관리**: 역할 기반 권한 시스템 (관리자, 교사, 학생)

### 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **AI Integration**: ChromaDB (벡터 DB), LLM API
- **Authentication**: NextAuth.js

## 🏗️ 아키텍처 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    EduBridge Platform                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React + TypeScript + Tailwind)          │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes (RESTful API)                          │
├─────────────────────────────────────────────────────────────┤
│  Prisma ORM + SQLite Database                               │
├─────────────────────────────────────────────────────────────┤
│  AI Server Integration                                      │
│  ├── Educational AI Server (ChromaDB + LLM)               │
│  └── Teacher Report Server (FastAPI + Streamlit)          │
└─────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

1. **사용자 요청** → Next.js Frontend
2. **API 호출** → Next.js API Routes
3. **데이터 처리** → Prisma ORM
4. **AI 서버 연동** → ChromaDB + LLM API
5. **응답 반환** → Frontend 렌더링

## 📁 디렉토리 구조

```
EduBridge/
├── 📁 docs/                          # 문서
│   ├── erd.svg                       # 데이터베이스 ERD
│   ├── README.md                     # 프로젝트 설명
│   └── PROJECT_STRUCTURE.md          # 이 문서
├── 📁 prisma/                        # 데이터베이스
│   ├── schema.prisma                 # Prisma 스키마
│   ├── seed.ts                       # 시드 데이터
│   ├── dev.db                        # SQLite 데이터베이스
│   └── migrations/                   # 마이그레이션 파일
├── 📁 public/                        # 정적 파일
│   └── uploads/                      # 업로드된 파일
├── 📁 src/                           # 소스 코드
│   ├── 📁 app/                       # Next.js App Router
│   │   ├── 📁 (afterLogin)/          # 로그인 후 페이지
│   │   │   ├── 📁 admin/             # 관리자 페이지
│   │   │   ├── 📁 dashboard/         # 대시보드
│   │   │   ├── 📁 my/                # 개인 페이지
│   │   │   ├── 📁 problems/           # 문제 관리
│   │   │   ├── 📁 reports/            # 리포트 관리
│   │   │   ├── 📁 students/           # 학생 관리
│   │   │   ├── 📁 teacher-reports/    # 교사 리포트
│   │   │   └── 📁 vector-search/      # 벡터 검색
│   │   ├── 📁 api/                   # API 엔드포인트
│   │   │   ├── 📁 ai/                # AI 관련 API
│   │   │   ├── 📁 auth/               # 인증 API
│   │   │   ├── 📁 problems/           # 문제 API
│   │   │   ├── 📁 reports/            # 리포트 API
│   │   │   ├── 📁 students/           # 학생 API
│   │   │   ├── 📁 textbooks/           # 교과서 API
│   │   │   └── 📁 teacher-reports/    # 교사 리포트 API
│   │   ├── 📁 login/                 # 로그인 페이지
│   │   ├── 📁 signup/                 # 회원가입 페이지
│   │   └── layout.tsx                 # 루트 레이아웃
│   ├── 📁 components/                 # React 컴포넌트
│   │   ├── 📁 ai/                     # AI 관련 컴포넌트
│   │   ├── 📁 dashboard/              # 대시보드 컴포넌트
│   │   ├── 📁 landing/                # 랜딩 페이지 컴포넌트
│   │   ├── 📁 layout/                 # 레이아웃 컴포넌트
│   │   ├── 📁 ui/                     # UI 컴포넌트
│   │   └── 📁 vector/                 # 벡터 검색 컴포넌트
│   ├── 📁 hooks/                      # React Hooks
│   │   ├── 📁 keys/                   # React Query 키
│   │   ├── auth.ts                    # 인증 훅
│   │   ├── learning.ts                # 학습 관련 훅
│   │   ├── problems.ts                # 문제 관련 훅
│   │   ├── reports.ts                 # 리포트 관련 훅
│   │   └── students.ts                # 학생 관련 훅
│   ├── 📁 lib/                        # 유틸리티 라이브러리
│   │   ├── 📁 ai-server/              # AI 서버 연동
│   │   ├── 📁 config/                 # 설정 파일
│   │   ├── 📁 core/                   # 핵심 기능
│   │   ├── 📁 utils/                  # 유틸리티 함수
│   │   └── 📁 vector/                 # 벡터 데이터베이스
│   ├── 📁 server/                     # 서버 사이드 로직
│   │   ├── 📁 dto/                    # 데이터 전송 객체
│   │   ├── 📁 repositories/            # 데이터 접근 계층
│   │   └── 📁 services/               # 비즈니스 로직
│   ├── 📁 services/                   # 클라이언트 서비스
│   ├── 📁 types/                      # TypeScript 타입 정의
│   └── middleware.ts                  # Next.js 미들웨어
├── 📄 package.json                    # 프로젝트 의존성
├── 📄 next.config.js                  # Next.js 설정
├── 📄 tailwind.config.ts              # Tailwind CSS 설정
├── 📄 tsconfig.json                   # TypeScript 설정
└── 📄 docker-compose.yml              # Docker 설정
```

## 🗄️ 데이터베이스 스키마

### 핵심 모델

#### 1. User (사용자)

```prisma
model User {
  id               String             @id @default(cuid())
  email            String             @unique
  name             String
  role             String             // ADMIN, TEACHER, STUDENT
  status           String             @default("ACTIVE")
  school           String?
  subject          String?
  grade            String?
  // ... 관계 필드들
}
```

#### 2. Educational AI System

- **Textbook**: 교과서 정보
- **DocumentChunk**: 문서 청크 (ChromaDB 연동)
- **AIGeneratedQuestion**: AI 생성 문제
- **QuestionOption**: 문제 선택지
- **SearchQuery**: 검색 쿼리
- **SearchResult**: 검색 결과

#### 3. Teacher Report System

- **TeacherReport**: 교사 리포트
- **ReportAnalysis**: 리포트 분석
- **StudentData**: 학생 데이터
- **ClassInfo**: 학급 정보

#### 4. AI 서버 관리

- **AIServerStatus**: AI 서버 상태
- **AIServerSync**: AI 서버 동기화
- **AIApiUsage**: API 사용량
- **AIPerformanceMetric**: 성능 지표

#### 5. 실제 AI 서버 데이터 구조

- **ChromaDBCollection**: ChromaDB 컬렉션
- **ChromaDBEmbedding**: ChromaDB 임베딩
- **SampleDataTemplate**: 샘플 데이터 템플릿
- **QuestionHistory**: 문제 생성 히스토리

## 🔌 API 엔드포인트

### 인증 관련

- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/setup` - 역할 설정

### Educational AI System

- `GET/POST /api/textbooks` - 교과서 관리
- `GET/PUT/DELETE /api/textbooks/[id]` - 교과서 상세
- `GET/POST /api/questions` - AI 문제 생성
- `POST /api/search` - RAG 벡터 검색

### Teacher Report System

- `GET/POST /api/teacher-reports` - 교사 리포트
- `GET /api/teacher-reports/[id]` - 리포트 상세

### 통합 관리

- `GET /api/dashboard` - 대시보드 데이터
- `GET /api/ai/servers` - AI 서버 상태
- `POST /api/ai/sync` - AI 서버 동기화

### 기존 기능

- `GET/POST /api/problems` - 문제 관리
- `GET/POST /api/reports` - 분석 리포트
- `GET/POST /api/students` - 학생 관리

## 🤖 AI 서버 연동

### 1. Educational AI Server

- **기능**: 교과서 기반 AI 문제 생성, RAG 검색
- **기술**: ChromaDB (벡터 DB), LLM API
- **연동**: `/api/questions`, `/api/search`

### 2. Teacher Report Server

- **기능**: 학생 데이터 분석, 리포트 생성
- **기술**: FastAPI, Streamlit, 데이터 분석
- **연동**: `/api/teacher-reports`

### 현재 상태

- **시뮬레이션 모드**: 실제 AI 서버 없이도 모든 기능 동작
- **데이터 저장**: Prisma 데이터베이스에 모든 정보 저장
- **확장 가능**: 나중에 실제 AI 서버 연동 가능

## 🎨 프론트엔드 구조

### 페이지 구조

```
app/
├── (afterLogin)/          # 로그인 후 페이지
│   ├── admin/             # 관리자 전용
│   ├── dashboard/         # 대시보드
│   ├── my/                # 개인 페이지
│   ├── problems/          # 문제 관리
│   ├── reports/           # 리포트 관리
│   ├── students/          # 학생 관리
│   ├── teacher-reports/   # 교사 리포트
│   └── vector-search/     # 벡터 검색
├── login/                 # 로그인
├── signup/               # 회원가입
└── layout.tsx            # 루트 레이아웃
```

### 컴포넌트 구조

```
components/
├── ai/                    # AI 관련 컴포넌트
├── dashboard/             # 대시보드 컴포넌트
├── landing/               # 랜딩 페이지 컴포넌트
├── layout/                # 레이아웃 컴포넌트
├── ui/                    # 재사용 가능한 UI 컴포넌트
└── vector/                # 벡터 검색 컴포넌트
```

### 상태 관리

- **React Query**: 서버 상태 관리
- **React Hooks**: 클라이언트 상태 관리
- **NextAuth**: 인증 상태 관리

## ⚙️ 개발 환경 설정

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn
- Git

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 데이터베이스 설정
npm run db:generate
npm run db:seed

# 개발 서버 실행
npm run dev
```

### 주요 스크립트

```json
{
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "db:seed": "tsx prisma/seed.ts",
  "db:studio": "prisma studio",
  "db:generate": "prisma generate"
}
```

### 환경 변수

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
CHROMA_URL="http://localhost:8000"
```

## 📊 현재 상태

### ✅ 완료된 기능

- [x] 데이터베이스 스키마 설계
- [x] API 엔드포인트 구현
- [x] 시뮬레이션 모드 구현
- [x] 시드 데이터 생성
- [x] 기본 인증 시스템
- [x] 역할 기반 권한 관리

### 🚧 진행 중인 작업

- [ ] 프론트엔드 UI 완성
- [ ] 실제 AI 서버 연동
- [ ] 성능 최적화
- [ ] 테스트 코드 작성

### 📋 향후 계획

- [ ] 실제 ChromaDB 서버 연동
- [ ] LLM API 연동
- [ ] Teacher Report Server 연동
- [ ] 프로덕션 배포
- [ ] 모니터링 시스템 구축

## 🔗 관련 문서

- [README.md](./README.md) - 프로젝트 기본 정보
- [ERD](./erd.svg) - 데이터베이스 관계도
- [API 문서](./API_DOCUMENTATION.md) - API 상세 문서

---

**최종 업데이트**: 2025년 1월 21일  
**문서 버전**: 1.0.0  
**작성자**: EduBridge Development Team
