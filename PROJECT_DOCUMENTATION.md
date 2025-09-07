# EduBridge AI Platform - 프로젝트 문서

## 📖 프로젝트 개요

**EduBridge**는 AI 기반 교육 플랫폼으로, 선생님과 학생을 연결하고 개인화된 학습 경험과 진로 상담을 통해 혁신적인 교육 성과를 만들어가는 통합 교육 솔루션입니다.

### 🎯 핵심 목표

- 학습 부진 학생을 위한 맞춤형 학습 경로 추천
- AI 튜터를 통한 개인화된 학습 지원
- 교사를 위한 학급 단위 학습 분석 및 피드백 지원
- 효율적인 교육 관리 시스템 구축

## 🏗️ 기술 스택

### Frontend

- **Next.js 14** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성 보장
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Radix UI** - 접근성이 뛰어난 UI 컴포넌트
- **Lucide React** - 아이콘 라이브러리

### Backend & Database

- **Next.js API Routes** - 서버리스 API 엔드포인트
- **Prisma ORM** - 타입 안전한 데이터베이스 ORM
- **SQLite** - 개발용 로컬 데이터베이스

### State Management & API

- **TanStack Query** - 서버 상태 관리 및 캐싱
- **Axios** - HTTP 클라이언트
- **React Query DevTools** - 개발자 도구

### Authentication

- **NextAuth.js** - 인증 프레임워크
- **Google OAuth** - 소셜 로그인 (설정 필요)
- **Credentials Provider** - 이메일/비밀번호 로그인

### Development Tools

- **ESLint** - 코드 품질 관리
- **TypeScript** - 정적 타입 검사
- **PostCSS** - CSS 후처리

## 📁 프로젝트 구조

```
edubridge-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 라우트
│   │   │   ├── auth/          # 인증 API (NextAuth)
│   │   │   ├── problems/      # 문제 관리 API
│   │   │   ├── students/      # 학생 관리 API
│   │   │   ├── reports/       # 분석 리포트 API
│   │   │   ├── stats/         # 통계 API
│   │   │   ├── learning-materials/ # 학습 자료 API
│   │   │   └── upload/        # 파일 업로드 API
│   │   ├── dashboard/         # 대시보드 페이지
│   │   ├── login/            # 로그인 페이지
│   │   ├── signup/           # 회원가입 페이지
│   │   ├── problems/         # 문제 관리 페이지
│   │   ├── students/         # 학생 관리 페이지
│   │   ├── reports/          # 분석 리포트 페이지
│   │   ├── projects/         # 프로젝트 관리 페이지
│   │   ├── profile/          # 프로필 페이지
│   │   ├── demo/             # 데모 페이지
│   │   ├── globals.css       # 전역 스타일
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   ├── page.tsx          # 홈페이지 (랜딩)
│   │   ├── providers.tsx     # TanStack Query Provider
│   │   └── middleware.ts     # NextAuth 미들웨어
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트 (Radix UI)
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── dashboard/        # 대시보드 컴포넌트
│   │   └── landing/          # 랜딩 페이지 컴포넌트
│   ├── lib/                  # 유틸리티 및 설정
│   │   ├── auth.ts           # NextAuth 설정
│   │   ├── prisma.ts         # Prisma 클라이언트
│   │   ├── utils.ts          # 유틸리티 함수
│   │   ├── api.ts            # Axios 설정
│   │   ├── api-services.ts   # API 서비스 함수
│   │   └── query-client.ts   # TanStack Query 설정
│   ├── hooks/                # 커스텀 훅
│   │   └── use-api.ts        # API 관련 훅
│   └── types/                # TypeScript 타입 정의
│       ├── index.ts          # 주요 타입 정의
│       └── next-auth.d.ts    # NextAuth 타입 확장
├── prisma/
│   ├── schema.prisma         # 데이터베이스 스키마
│   ├── dev.db               # SQLite 개발 데이터베이스
│   ├── migrations/          # 데이터베이스 마이그레이션
│   └── seed.ts              # 시드 데이터
├── public/                   # 정적 파일
├── .env.local               # 환경 변수 (로컬)
├── .env.example             # 환경 변수 예시
├── tailwind.config.ts       # Tailwind 설정
├── postcss.config.js        # PostCSS 설정
├── package.json              # 프로젝트 의존성
├── setup.bat                # Windows 설치 스크립트
├── setup.sh                 # Unix 설치 스크립트
└── README.md                # 프로젝트 문서
```

## 🗄️ 데이터베이스 스키마

### 주요 모델들

#### User (사용자)

- **교사**: 이름, 이메일, 부서, 아바타, 소개
- **학생**: 이름, 이메일, 학년, 상태
- **역할**: TEACHER, STUDENT, ADMIN
- **상태**: ACTIVE, INACTIVE, SUSPENDED

#### UserPreferences (사용자 선호도)

- 학습 스타일, 관심사, 선호 난이도
- 알림 설정 (이메일, 푸시, 주간 리포트)
- JSON 문자열로 저장 (SQLite 제약)

#### Problem (문제)

- 문제 유형: MULTIPLE_CHOICE, SHORT_ANSWER, ESSAY, CODING, MATH
- 난이도: EASY, MEDIUM, HARD, EXPERT
- 선택지, 정답, 힌트, 태그 (JSON 형태)
- 메타데이터: 점수, 시간 제한, 활성 상태

#### StudentProgress (학습 진도)

- 학생별 학습 진행 상황 추적
- 상태: NOT_STARTED, IN_PROGRESS, COMPLETED, REVIEW_NEEDED
- 점수, 소요 시간, 시도 횟수 기록

#### AnalysisReport (분석 리포트)

- 리포트 유형: MONTHLY, INDIVIDUAL, SUBJECT, WEEKLY
- AI 생성 인사이트, 권장사항, 강점/약점 분석
- 상태: COMPLETED, IN_PROGRESS, PENDING

#### LearningMaterial (학습 자료)

- 제목, 설명, 내용, 과목, 난이도
- 예상 소요 시간, 첨부 파일
- 상태: DRAFT, PUBLISHED, ARCHIVED

#### CareerCounseling (진로 상담)

- 상담 유형: ACADEMIC, CAREER, PERSONAL, UNIVERSITY_GUIDANCE
- AI 분석 결과: 진로 제안, 대학 추천, 스킬 갭 분석
- 상태: COMPLETED, IN_PROGRESS, PENDING

## 🚀 주요 기능

### 1. 대시보드

- **통계 카드**: 활성 학생 수, 총 문제 수, 완료된 리포트 수, 평균 진행률
- **최근 활동**: 실시간 학습 활동 피드
- **빠른 작업**: 자주 사용하는 기능에 빠른 접근
- **실시간 모니터링**: 학생들의 학습 현황을 한눈에 파악

### 2. 문제 관리

- **문제 생성**: 다양한 유형의 문제 생성 (객관식, 주관식, 에세이, 코딩, 수학)
- **난이도 분류**: EASY, MEDIUM, HARD, EXPERT 레벨별 관리
- **과목별 분류**: 수학, 과학, 언어 등 과목별 문제 관리
- **태그 시스템**: 문제 분류 및 검색을 위한 태그 기능
- **실시간 데이터**: TanStack Query를 통한 실시간 데이터 관리

### 3. 학생 관리

- **학생 목록**: 학년별, 상태별 학생 관리
- **진도 추적**: 개별 학생의 학습 진도 모니터링
- **성과 분석**: 점수, 시도 횟수, 소요 시간 분석
- **개별 상담**: 학생별 맞춤 상담 및 피드백

### 4. 분석 리포트

- **AI 생성 리포트**: 월간, 개별, 과목별, 주간 리포트
- **성과 분석**: 학급 단위 성취도 분석
- **인사이트 제공**: AI 기반 학습 패턴 분석
- **개선 제안**: 맞춤형 학습 권장사항

### 5. 학습 자료 관리

- **자료 업로드**: 다양한 형태의 학습 자료 관리
- **과목별 분류**: 과목별 학습 자료 정리
- **난이도 설정**: 학습자 수준에 맞는 자료 분류
- **상태 관리**: 초안, 게시, 보관 상태 관리

### 6. 진로 상담

- **AI 상담**: 학업, 진로, 개인, 대학 진학 상담
- **진로 제안**: AI 기반 맞춤형 진로 추천
- **대학 추천**: 학생 프로필 기반 대학 추천
- **스킬 갭 분석**: 부족한 역량 분석 및 제안

### 7. 사용자 관리

- **프로필 관리**: 개인 정보 및 설정 관리
- **역할 기반 접근**: 교사, 학생, 관리자 권한 관리
- **선호도 설정**: 학습 스타일 및 관심사 설정

## 🔧 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd edubridge-platform
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 편집하여 필요한 환경 변수를 설정:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
```

### 4. 데이터베이스 설정

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하여 애플리케이션을 확인할 수 있습니다.

### 6. 빠른 시작 (자동 설치)

Windows 사용자:

```bash
setup.bat
```

Unix/Linux/Mac 사용자:

```bash
chmod +x setup.sh
./setup.sh
```

## 🔐 인증 시스템

### 현재 구현된 인증 방법

1. **Credentials 로그인**: 이메일/비밀번호

   - 데모 계정: `demo@example.com` / `demo123`
   - 실제 구현에서는 데이터베이스에서 사용자 검증

2. **Google OAuth**: 설정 필요 (현재 비활성화)
   - Google Cloud Console에서 리다이렉트 URI 설정 필요
   - 환경 변수 설정 후 활성화 가능

### 보호된 경로

- `/dashboard` - 대시보드
- `/problems` - 문제 관리
- `/students` - 학생 관리
- `/reports` - 분석 리포트
- `/profile` - 프로필

## 📊 API 구조

### 구현된 API 엔드포인트

#### 인증 API (`/api/auth`)

- NextAuth.js 기반 인증 시스템
- JWT 토큰 기반 세션 관리
- Google OAuth 및 Credentials 로그인 지원

#### 문제 관리 API (`/api/problems`)

- `GET /api/problems` - 문제 목록 조회 (검색, 필터링, 페이지네이션)
- `POST /api/problems` - 새 문제 생성
- `GET /api/problems/[id]` - 특정 문제 조회
- `PUT /api/problems/[id]` - 문제 수정
- `DELETE /api/problems/[id]` - 문제 삭제

#### 학생 관리 API (`/api/students`)

- `GET /api/students` - 학생 목록 조회
- `POST /api/students` - 새 학생 등록
- `GET /api/students/[id]` - 특정 학생 조회
- `PUT /api/students/[id]` - 학생 정보 수정

#### 분석 리포트 API (`/api/reports`)

- `GET /api/reports` - 리포트 목록 조회
- `POST /api/reports` - 새 리포트 생성
- `GET /api/reports/[id]` - 특정 리포트 조회
- `GET /api/reports/[id]/download` - 리포트 다운로드

#### 통계 API (`/api/stats`)

- `GET /api/stats?type=problems` - 문제 통계
- `GET /api/stats?type=students` - 학생 통계
- `GET /api/stats?type=reports` - 리포트 통계
- `GET /api/stats` - 전체 통계

#### 학습 자료 API (`/api/learning-materials`)

- `GET /api/learning-materials` - 학습 자료 목록
- `POST /api/learning-materials` - 새 학습 자료 생성
- `PUT /api/learning-materials/[id]` - 학습 자료 수정
- `DELETE /api/learning-materials/[id]` - 학습 자료 삭제

#### 파일 업로드 API (`/api/upload`)

- `POST /api/upload` - 파일 업로드 처리

### TanStack Query 훅들

- `useProblems()` - 문제 관리 (CRUD 작업)
- `useStudents()` - 학생 관리 (CRUD 작업)
- `useReports()` - 리포트 관리 (CRUD 작업)
- `useLearning()` - 학습 자료 관리 (CRUD 작업)
- `useStats()` - 통계 데이터 조회

### API 서비스 함수들

- `authApi` - 인증 관련 API 호출
- `problemsApi` - 문제 관리 API 호출
- `studentsApi` - 학생 관리 API 호출
- `reportsApi` - 리포트 관리 API 호출
- `learningApi` - 학습 자료 관리 API 호출

## 🎨 UI/UX 특징

### 디자인 시스템

- **색상**: 파란색-보라색 그라데이션 브랜드 컬러
- **타이포그래피**: Inter 폰트 사용
- **레이아웃**: 반응형 그리드 시스템
- **컴포넌트**: Radix UI 기반 접근성 고려

### 반응형 디자인

- 모바일 우선 설계
- 태블릿 및 데스크톱 최적화
- 사이드바 토글 기능

## 🚧 현재 제한사항

### 기술적 제한사항

1. **AI 기능**: UI만 구현, 실제 LLM 연동 없음
2. **데이터베이스 제약**: SQLite 사용으로 배열/열거형 타입 제한 (JSON 문자열로 저장)
3. **인증 시스템**: Google OAuth 설정 미완료 (환경 변수 설정 필요)
4. **파일 업로드**: 실제 파일 처리 로직 미구현
5. **실시간 기능**: WebSocket 기반 실시간 통신 미구현

### 기능적 제한사항

1. **AI 분석**: 실제 AI 기반 학습 분석 로직 없음
2. **학습 경로 추천**: 알고리즘 미구현
3. **실시간 피드백**: 실제 실시간 피드백 시스템 없음
4. **데이터 시드**: 개발용 더미 데이터만 존재
5. **이메일 알림**: 실제 이메일 발송 기능 없음

## 🔮 향후 개발 계획

### Phase 1: AI 기능 통합 (1-2개월)

- **OpenAI GPT-4 API 연동**: 실제 AI 기반 학습 분석 구현
- **RAG (Retrieval-Augmented Generation)**: 학습 자료 기반 질의응답 시스템
- **LangChain 프레임워크 도입**: AI 워크플로우 관리
- **실시간 피드백**: AI 튜터 기능 구현

### Phase 2: 고급 기능 (2-3개월)

- **Few-shot Learning**: 적은 데이터로 학습 패턴 분석
- **실시간 학습 분석**: WebSocket 기반 실시간 모니터링
- **맞춤형 학습 경로**: AI 기반 개인화 학습 경로 생성
- **진로 상담 AI**: 실제 AI 기반 진로 상담 시스템

### Phase 3: 확장 기능 (3-6개월)

- **파일 업로드 및 관리**: 실제 파일 처리 시스템
- **실시간 채팅**: 교사-학생 간 실시간 소통
- **모바일 앱**: React Native 기반 모바일 앱
- **다국어 지원**: i18n 기반 다국어 지원

### Phase 4: 고도화 (6개월+)

- **머신러닝 모델**: 학습 패턴 예측 모델
- **블록체인 인증**: 학습 성과 인증 시스템
- **VR/AR 학습**: 몰입형 학습 환경
- **클라우드 배포**: AWS/Azure 클라우드 배포

## 📝 개발 가이드라인

### 코드 스타일

- TypeScript 엄격 모드 사용
- ESLint 규칙 준수
- 컴포넌트 기반 아키텍처

### 커밋 컨벤션

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 스타일 변경
- `refactor:` 리팩토링

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

## 🤝 기여 방법

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성
3. 코드 작성 및 테스트
4. Pull Request 생성
5. 코드 리뷰 및 병합

## 📝 개발 가이드라인

### 코드 스타일

- **TypeScript 엄격 모드** 사용
- **ESLint 규칙** 준수
- **컴포넌트 기반 아키텍처** 적용
- **함수형 프로그래밍** 패러다임 선호

### 네이밍 컨벤션

- **컴포넌트**: PascalCase (예: `UserProfile`)
- **함수/변수**: camelCase (예: `getUserData`)
- **상수**: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- **파일명**: kebab-case (예: `user-profile.tsx`)

### 커밋 컨벤션

- `feat:` 새로운 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `refactor:` 코드 리팩토링
- `test:` 테스트 코드 추가/수정
- `chore:` 빌드 프로세스, 도구 변경

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치
- `release/*`: 릴리스 준비 브랜치

## 🤝 기여 방법

### 1. 이슈 생성 또는 확인

- 새로운 기능 요청이나 버그 리포트를 GitHub Issues에 생성
- 기존 이슈가 있는지 확인 후 작업

### 2. 브랜치 생성

```bash
git checkout -b feature/새로운-기능
# 또는
git checkout -b fix/버그-수정
```

### 3. 코드 작성 및 테스트

- 코드 작성 후 ESLint 검사 통과 확인
- TypeScript 타입 오류 해결
- 필요한 경우 테스트 코드 작성

### 4. 커밋 및 푸시

```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin feature/새로운-기능
```

### 5. Pull Request 생성

- GitHub에서 Pull Request 생성
- 변경사항에 대한 상세한 설명 작성
- 관련 이슈 번호 링크

### 6. 코드 리뷰 및 병합

- 코드 리뷰 과정을 거쳐 승인
- 모든 체크가 통과되면 메인 브랜치에 병합

## 📞 지원 및 문의

프로젝트 관련 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.

### 개발자 연락처

- **이메일**: [개발자 이메일]
- **GitHub**: [GitHub 프로필]
- **이슈 트래커**: [GitHub Issues 링크]

## 📋 프로젝트 현황 요약

### ✅ 완료된 기능

- **프론트엔드 UI**: 모든 주요 페이지 및 컴포넌트 구현 완료
- **데이터베이스 스키마**: Prisma 기반 완전한 데이터 모델 설계
- **API 엔드포인트**: RESTful API 구조 완성
- **인증 시스템**: NextAuth.js 기반 기본 인증 구현
- **상태 관리**: TanStack Query를 통한 서버 상태 관리
- **반응형 디자인**: 모바일 우선 반응형 UI 구현

### 🔄 진행 중인 작업

- **데이터 시드**: 실제 데이터베이스 시드 데이터 구축
- **API 로직**: 백엔드 비즈니스 로직 구현
- **테스트**: 단위 테스트 및 통합 테스트 작성

### 🎯 다음 단계

- **AI 통합**: OpenAI API 연동 및 실제 AI 기능 구현
- **파일 업로드**: 실제 파일 처리 시스템 구축
- **실시간 기능**: WebSocket 기반 실시간 통신 구현
- **배포**: 프로덕션 환경 배포 준비

---

**EduBridge AI Platform** - AI로 연결되는 교육의 미래를 만들어갑니다.
