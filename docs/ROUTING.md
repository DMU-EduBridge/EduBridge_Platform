# EduBridge 라우팅 구조 문서

## 📋 개요

EduBridge는 Next.js App Router를 사용하여 구현된 교육 플랫폼입니다. 사용자 역할(학생, 교사, 관리자)에 따라 다른 페이지에 접근할 수 있습니다.

## 🗺️ 전체 시스템 페이지 구성도

```
EduBridge 시스템 구조
├── 📱 공개 페이지 (모든 사용자)
│   ├── / (랜딩 페이지)
│   ├── /login (로그인)
│   ├── /signup (회원가입)
│   ├── /forgot-password (비밀번호 찾기)
│   ├── /about (소개)
│   ├── /features (기능)
│   ├── /how-it-works (작동 방식)
│   ├── /pricing (가격)
│   ├── /contact (문의)
│   ├── /help (도움말)
│   ├── /privacy (개인정보처리방침)
│   ├── /terms (이용약관)
│   ├── /integrations (통합)
│   ├── /demo (데모)
│   ├── /setup (설정)
│   ├── /status (상태)
│   └── /api (API 문서)
│
├── 👨‍🎓 학생 전용 페이지 (로그인 후)
│   ├── /my/learning (학습 목록)
│   │   └── /my/learning/[studyId] (학습 상세)
│   │       ├── /problems (문제 목록 → 첫 번째 문제로 리다이렉트)
│   │       ├── /problems/[problemId] (문제 풀이)
│   │       ├── /problems/[problemId]/review (문제 리뷰)
│   │       └── /results (학습 결과)
│   ├── /my/reports (개인 리포트)
│   └── /my/settings (개인 설정)
│
├── 👨‍🏫 교사 전용 페이지 (로그인 후)
│   ├── /dashboard (대시보드)
│   ├── /problems (문제 관리)
│   │   ├── /new (새 문제 생성)
│   │   ├── /generate (AI 문제 생성)
│   │   └── /[problemId] (문제 상세)
│   │       ├── /manage (문제 관리)
│   │       └── /review (문제 리뷰)
│   ├── /learning-materials (학습 자료)
│   ├── /students (학생 관리)
│   ├── /reports (리포트 관리)
│   │   └── /[id] (리포트 상세)
│   ├── /teacher-reports (교사 리포트)
│   ├── /vector-search (벡터 검색)
│   └── /profile (프로필)
│
└── 👨‍💼 관리자 전용 페이지 (로그인 후)
    ├── /admin (관리자 대시보드)
    ├── /admin/users (사용자 관리)
    ├── /admin/settings (시스템 설정)
    ├── /settings (시스템 설정)
    └── 모든 교사 페이지 접근 가능
```

### 🔄 사용자 플로우 다이어그램

```
로그인 전 플로우:
비로그인 사용자 → / (랜딩) → /login 또는 /signup

로그인 후 플로우:
학생: / → /my/learning → /my/learning/[studyId]/problems/[problemId] → /my/learning/[studyId]/results
교사: / → /dashboard → /problems → /problems/[problemId] → /reports
관리자: / → /admin → /admin/users → 모든 페이지 접근 가능
```

### 🎯 핵심 기능별 페이지 그룹

#### 📚 학습 관리 그룹

- `/my/learning` (학습 목록)
- `/my/learning/[studyId]` (학습 상세)
- `/my/learning/[studyId]/problems` (문제 목록)
- `/my/learning/[studyId]/problems/[problemId]` (문제 풀이)
- `/my/learning/[studyId]/results` (학습 결과)

#### 📝 문제 관리 그룹

- `/problems` (문제 목록)
- `/problems/new` (문제 생성)
- `/problems/generate` (AI 문제 생성)
- `/problems/[problemId]` (문제 상세)
- `/problems/[problemId]/manage` (문제 관리)
- `/problems/[problemId]/review` (문제 리뷰)

#### 📊 리포트 그룹

- `/my/reports` (개인 리포트 - 학생)
- `/reports` (리포트 관리 - 교사)
- `/reports/[id]` (리포트 상세)
- `/teacher-reports` (교사 리포트)

#### ⚙️ 관리 그룹

- `/admin` (관리자 대시보드)
- `/admin/users` (사용자 관리)
- `/admin/settings` (시스템 설정)
- `/settings` (시스템 설정)
- `/students` (학생 관리)
- `/learning-materials` (학습 자료 관리)

### 🔗 페이지 간 네비게이션 관계도

```
📱 공개 영역
├── / (랜딩)
│   ├── → /login (로그인 버튼)
│   ├── → /signup (회원가입 버튼)
│   ├── → /about (소개 링크)
│   ├── → /features (기능 링크)
│   └── → /pricing (가격 링크)
│
├── /login
│   ├── → / (로그인 성공 시 역할별 리다이렉트)
│   ├── → /signup (회원가입 링크)
│   └── → /forgot-password (비밀번호 찾기)
│
└── /signup
    ├── → /login (회원가입 완료 시)
    └── → / (취소 시)

👨‍🎓 학생 영역
├── /my/learning
│   ├── → /my/learning/[studyId] (학습 자료 선택)
│   ├── → /my/reports (리포트 보기)
│   └── → /my/settings (설정)
│
├── /my/learning/[studyId]
│   ├── → /my/learning/[studyId]/problems (문제 풀기 시작)
│   └── → /my/learning (뒤로 가기)
│
├── /my/learning/[studyId]/problems
│   └── → /my/learning/[studyId]/problems/[problemId] (첫 번째 문제로 자동 리다이렉트)
│
├── /my/learning/[studyId]/problems/[problemId]
│   ├── → /my/learning/[studyId]/problems/[nextProblemId] (다음 문제)
│   ├── → /my/learning/[studyId]/results (모든 문제 완료 시)
│   ├── → /my/learning/[studyId]/problems/[problemId]/review (오답 체크)
│   └── → /my/learning (학습 목록으로)
│
├── /my/learning/[studyId]/results
│   ├── → /my/learning/[studyId]/problems (다시 풀기)
│   └── → /my/learning (학습 목록으로)
│
└── /my/reports
    ├── → /my/learning (학습하기)
    └── → /my/settings (설정)

👨‍🏫 교사 영역
├── /dashboard
│   ├── → /problems (문제 관리)
│   ├── → /learning-materials (학습 자료)
│   ├── → /students (학생 관리)
│   ├── → /reports (리포트)
│   └── → /profile (프로필)
│
├── /problems
│   ├── → /problems/new (새 문제 생성)
│   ├── → /problems/generate (AI 문제 생성)
│   ├── → /problems/[problemId] (문제 상세)
│   └── → /dashboard (대시보드로)
│
├── /problems/[problemId]
│   ├── → /problems/[problemId]/manage (문제 관리)
│   ├── → /problems/[problemId]/review (문제 리뷰)
│   └── → /problems (문제 목록으로)
│
├── /learning-materials
│   ├── → /problems (문제 관리)
│   └── → /dashboard (대시보드로)
│
├── /students
│   ├── → /reports (리포트 보기)
│   └── → /dashboard (대시보드로)
│
└── /reports
    ├── → /reports/[id] (리포트 상세)
    └── → /dashboard (대시보드로)

👨‍💼 관리자 영역
├── /admin
│   ├── → /admin/users (사용자 관리)
│   ├── → /admin/settings (시스템 설정)
│   ├── → /dashboard (교사 대시보드)
│   └── → /problems (문제 관리)
│
├── /admin/users
│   ├── → /admin/users/[userId] (사용자 상세)
│   └── → /admin (관리자 대시보드로)
│
└── /admin/settings
    └── → /admin (관리자 대시보드로)
```

### 🎯 주요 사용자 여정 (User Journey)

#### 📚 학생 학습 여정

```
1. 로그인 → /my/learning (학습 목록 확인)
2. 학습 자료 선택 → /my/learning/[studyId] (학습 상세)
3. 문제 풀기 시작 → /my/learning/[studyId]/problems/[problemId] (문제 풀이)
4. 문제 순차 풀이 → 다음 문제로 이동
5. 모든 문제 완료 → /my/learning/[studyId]/results (결과 확인)
6. 결과 확인 후 → /my/learning (다른 학습 선택) 또는 /my/reports (리포트 확인)
```

#### 👨‍🏫 교사 문제 관리 여정

```
1. 로그인 → /dashboard (대시보드 확인)
2. 문제 관리 → /problems (문제 목록)
3. 새 문제 생성 → /problems/new 또는 /problems/generate (AI 생성)
4. 문제 상세 확인 → /problems/[problemId]
5. 문제 관리 → /problems/[problemId]/manage
6. 학생 리포트 확인 → /reports
```

#### 👨‍💼 관리자 시스템 관리 여정

```
1. 로그인 → /admin (관리자 대시보드)
2. 사용자 관리 → /admin/users
3. 시스템 설정 → /admin/settings
4. 전체 시스템 모니터링 → 모든 페이지 접근 가능
```

## 🏗️ 라우팅 구조

### 1. 루트 레이아웃 (`/`)

- **파일**: `src/app/page.tsx`
- **설명**: 메인 랜딩 페이지
- **접근 권한**: 모든 사용자
- **리다이렉트 로직**:
  - 학생: `/my/learning`
  - 관리자: `/admin`
  - 교사: `/dashboard`

### 2. 인증 관련 페이지

#### 2.1 로그인 (`/login`)

- **파일**: `src/app/login/page.tsx`
- **설명**: 사용자 로그인 페이지
- **접근 권한**: 비로그인 사용자

#### 2.2 회원가입 (`/signup`)

- **파일**: `src/app/signup/page.tsx`
- **설명**: 사용자 회원가입 페이지
- **접근 권한**: 비로그인 사용자

#### 2.3 비밀번호 찾기 (`/forgot-password`)

- **파일**: `src/app/forgot-password/page.tsx`
- **설명**: 비밀번호 재설정 페이지
- **접근 권한**: 비로그인 사용자

### 3. 공개 페이지

#### 3.1 소개 (`/about`)

- **파일**: `src/app/about/page.tsx`
- **설명**: 서비스 소개 페이지
- **접근 권한**: 모든 사용자

#### 3.2 기능 (`/features`)

- **파일**: `src/app/features/page.tsx`
- **설명**: 서비스 기능 소개
- **접근 권한**: 모든 사용자

#### 3.3 작동 방식 (`/how-it-works`)

- **파일**: `src/app/how-it-works/page.tsx`
- **설명**: 서비스 사용법 안내
- **접근 권한**: 모든 사용자

#### 3.4 가격 (`/pricing`)

- **파일**: `src/app/pricing/page.tsx`
- **설명**: 요금제 안내
- **접근 권한**: 모든 사용자

#### 3.5 문의 (`/contact`)

- **파일**: `src/app/contact/page.tsx`
- **설명**: 고객 문의 페이지
- **접근 권한**: 모든 사용자

#### 3.6 도움말 (`/help`)

- **파일**: `src/app/help/page.tsx`
- **설명**: 사용자 도움말
- **접근 권한**: 모든 사용자

#### 3.7 개인정보처리방침 (`/privacy`)

- **파일**: `src/app/privacy/page.tsx`
- **설명**: 개인정보 처리방침
- **접근 권한**: 모든 사용자

#### 3.8 이용약관 (`/terms`)

- **파일**: `src/app/terms/page.tsx`
- **설명**: 서비스 이용약관
- **접근 권한**: 모든 사용자

#### 3.9 통합 (`/integrations`)

- **파일**: `src/app/integrations/page.tsx`
- **설명**: 외부 서비스 통합 안내
- **접근 권한**: 모든 사용자

#### 3.10 데모 (`/demo`)

- **파일**: `src/app/demo/page.tsx`
- **설명**: 서비스 데모 페이지
- **접근 권한**: 모든 사용자

#### 3.11 설정 (`/setup`)

- **파일**: `src/app/setup/page.tsx`
- **설명**: 초기 설정 페이지
- **접근 권한**: 모든 사용자

#### 3.12 상태 (`/status`)

- **파일**: `src/app/status/page.tsx`
- **설명**: 서비스 상태 페이지
- **접근 권한**: 모든 사용자

#### 3.13 API (`/api`)

- **파일**: `src/app/api/page.tsx`
- **설명**: API 문서 페이지
- **접근 권한**: 모든 사용자

### 4. 로그인 후 페이지 (`/(afterLogin)`)

#### 4.1 대시보드 (`/dashboard`)

- **파일**: `src/app/(afterLogin)/dashboard/page.tsx`
- **설명**: 교사용 메인 대시보드
- **접근 권한**: 교사, 관리자

#### 4.2 학습 관리 (`/my/learning`)

- **파일**: `src/app/(afterLogin)/my/learning/page.tsx`
- **설명**: 학생용 학습 목록 페이지
- **접근 권한**: 학생

#### 4.3 학습 상세 (`/my/learning/[studyId]`)

- **파일**: `src/app/(afterLogin)/my/learning/[studyId]/page.tsx`
- **설명**: 특정 학습 자료 상세 페이지
- **접근 권한**: 학생
- **동적 라우팅**: `studyId` 파라미터

#### 4.4 문제 풀이 (`/my/learning/[studyId]/problems`)

- **파일**: `src/app/(afterLogin)/my/learning/[studyId]/problems/page.tsx`
- **설명**: 문제 목록 페이지 (자동으로 첫 번째 문제로 리다이렉트)
- **접근 권한**: 학생
- **동적 라우팅**: `studyId` 파라미터

#### 4.5 문제 상세 (`/my/learning/[studyId]/problems/[problemId]`)

- **파일**: `src/app/(afterLogin)/my/learning/[studyId]/problems/[problemId]/page.tsx`
- **설명**: 개별 문제 풀이 페이지
- **접근 권한**: 학생
- **동적 라우팅**: `studyId`, `problemId` 파라미터

#### 4.6 문제 리뷰 (`/my/learning/[studyId]/problems/[problemId]/review`)

- **파일**: `src/app/(afterLogin)/my/learning/[studyId]/problems/[problemId]/review/page.tsx`
- **설명**: 문제 오답 체크 페이지
- **접근 권한**: 학생
- **동적 라우팅**: `studyId`, `problemId` 파라미터

#### 4.7 결과 페이지 (`/my/learning/[studyId]/results`)

- **파일**: `src/app/(afterLogin)/my/learning/[studyId]/results/page.tsx`
- **설명**: 학습 결과 및 성적 확인 페이지
- **접근 권한**: 학생
- **동적 라우팅**: `studyId` 파라미터

#### 4.8 리포트 (`/my/reports`)

- **파일**: `src/app/(afterLogin)/my/reports/page.tsx`
- **설명**: 개인 학습 리포트 페이지
- **접근 권한**: 학생

#### 4.9 설정 (`/my/settings`)

- **파일**: `src/app/(afterLogin)/my/settings/page.tsx`
- **설명**: 개인 설정 페이지
- **접근 권한**: 학생

### 5. 교사/관리자 전용 페이지

#### 5.1 문제 관리 (`/problems`)

- **파일**: `src/app/(afterLogin)/problems/page.tsx`
- **설명**: 문제 목록 및 관리 페이지
- **접근 권한**: 교사, 관리자

#### 5.2 문제 생성 (`/problems/new`)

- **파일**: `src/app/(afterLogin)/problems/new/page.tsx`
- **설명**: 새 문제 생성 페이지
- **접근 권한**: 교사, 관리자

#### 5.3 문제 생성 (AI) (`/problems/generate`)

- **파일**: `src/app/(afterLogin)/problems/generate/page.tsx`
- **설명**: AI를 활용한 문제 생성 페이지
- **접근 권한**: 교사, 관리자

#### 5.4 문제 상세 (`/problems/[problemId]`)

- **파일**: `src/app/(afterLogin)/problems/[problemId]/page.tsx`
- **설명**: 문제 상세 정보 및 편집 페이지
- **접근 권한**: 교사, 관리자
- **동적 라우팅**: `problemId` 파라미터

#### 5.5 문제 관리 (`/problems/[problemId]/manage`)

- **파일**: `src/app/(afterLogin)/problems/[problemId]/manage/page.tsx`
- **설명**: 문제 관리 및 설정 페이지
- **접근 권한**: 교사, 관리자
- **동적 라우팅**: `problemId` 파라미터

#### 5.6 문제 리뷰 (`/problems/[problemId]/review`)

- **파일**: `src/app/(afterLogin)/problems/[problemId]/review/page.tsx`
- **설명**: 문제 리뷰 및 분석 페이지
- **접근 권한**: 교사, 관리자
- **동적 라우팅**: `problemId` 파라미터

#### 5.7 학습 자료 (`/learning-materials`)

- **파일**: `src/app/(afterLogin)/learning-materials/page.tsx`
- **설명**: 학습 자료 관리 페이지
- **접근 권한**: 교사, 관리자

#### 5.8 학생 관리 (`/students`)

- **파일**: `src/app/(afterLogin)/students/page.tsx`
- **설명**: 학생 목록 및 관리 페이지
- **접근 권한**: 교사, 관리자

#### 5.9 리포트 (`/reports`)

- **파일**: `src/app/(afterLogin)/reports/page.tsx`
- **설명**: 전체 리포트 관리 페이지
- **접근 권한**: 교사, 관리자

#### 5.10 리포트 상세 (`/reports/[id]`)

- **파일**: `src/app/(afterLogin)/reports/[id]/page.tsx`
- **설명**: 특정 리포트 상세 페이지
- **접근 권한**: 교사, 관리자
- **동적 라우팅**: `id` 파라미터

#### 5.11 교사 리포트 (`/teacher-reports`)

- **파일**: `src/app/(afterLogin)/teacher-reports/page.tsx`
- **설명**: 교사 전용 리포트 페이지
- **접근 권한**: 교사

#### 5.12 벡터 검색 (`/vector-search`)

- **파일**: `src/app/(afterLogin)/vector-search/page.tsx`
- **설명**: 벡터 기반 검색 페이지
- **접근 권한**: 교사, 관리자

#### 5.13 프로필 (`/profile`)

- **파일**: `src/app/(afterLogin)/profile/page.tsx`
- **설명**: 사용자 프로필 페이지
- **접근 권한**: 모든 로그인 사용자

#### 5.14 설정 (`/settings`)

- **파일**: `src/app/(afterLogin)/settings/page.tsx`
- **설명**: 시스템 설정 페이지
- **접근 권한**: 관리자

### 6. 관리자 전용 페이지

#### 6.1 관리자 대시보드 (`/admin`)

- **파일**: `src/app/(afterLogin)/admin/page.tsx`
- **설명**: 관리자 메인 대시보드
- **접근 권한**: 관리자만

#### 6.2 사용자 관리 (`/admin/users`)

- **파일**: `src/app/(afterLogin)/admin/users/page.tsx`
- **설명**: 사용자 계정 관리 페이지
- **접근 권한**: 관리자만

#### 6.3 관리자 설정 (`/admin/settings`)

- **파일**: `src/app/(afterLogin)/admin/settings/page.tsx`
- **설명**: 시스템 전체 설정 페이지
- **접근 권한**: 관리자만

## 🔐 접근 권한 매트릭스

| 페이지                | 학생 | 교사 | 관리자 |
| --------------------- | ---- | ---- | ------ |
| `/` (랜딩)            | ✅   | ✅   | ✅     |
| `/login`, `/signup`   | ✅   | ✅   | ✅     |
| 공개 페이지           | ✅   | ✅   | ✅     |
| `/my/learning/*`      | ✅   | ❌   | ❌     |
| `/my/reports`         | ✅   | ❌   | ❌     |
| `/my/settings`        | ✅   | ❌   | ❌     |
| `/dashboard`          | ❌   | ✅   | ✅     |
| `/problems/*`         | ❌   | ✅   | ✅     |
| `/learning-materials` | ❌   | ✅   | ✅     |
| `/students`           | ❌   | ✅   | ✅     |
| `/reports`            | ❌   | ✅   | ✅     |
| `/teacher-reports`    | ❌   | ✅   | ❌     |
| `/admin/*`            | ❌   | ❌   | ✅     |

## 🚀 주요 라우팅 특징

### 1. 역할 기반 리다이렉트

- 루트 페이지(`/`)에서 사용자 역할에 따라 자동 리다이렉트
- 학생: `/my/learning`
- 교사: `/dashboard`
- 관리자: `/admin`

### 2. 동적 라우팅

- `[studyId]`: 학습 자료 ID
- `[problemId]`: 문제 ID
- `[id]`: 리포트 ID

### 3. 중첩 라우팅

- 학습 관련 페이지는 `/my/learning/[studyId]/` 하위에 중첩
- 문제 관련 페이지는 `/problems/[problemId]/` 하위에 중첩

### 4. 레이아웃 구조

- `(afterLogin)`: 로그인 후 페이지들의 공통 레이아웃
- 인증 확인 및 대시보드 레이아웃 적용

### 5. 메타데이터

- 각 페이지별 SEO 최적화된 메타데이터 설정
- 동적 페이지는 `generateMetadata` 함수 사용

## 📝 참고사항

1. **인증**: `(afterLogin)` 그룹의 모든 페이지는 로그인 필수
2. **권한**: 각 페이지별로 역할 기반 접근 제어
3. **리다이렉트**: 권한이 없는 페이지 접근 시 적절한 페이지로 리다이렉트
4. **동적 라우팅**: `[]` 표기법으로 동적 세그먼트 구현
5. **레이아웃**: 공통 레이아웃을 통한 일관된 UI/UX 제공

---

_이 문서는 EduBridge 프로젝트의 라우팅 구조를 설명합니다. 페이지 추가나 수정 시 이 문서도 함께 업데이트해주세요._
