# EduBridge - 권한별 라우팅 가이드

본 문서는 역할(Role) 기반 접근 제어가 적용된 페이지 라우팅을 정리합니다.

## 역할 정의

- **STUDENT**: 학생 사용자
- **TEACHER**: 교사 사용자
- **ADMIN**: 관리자 (상위 권한, 교사용 페이지 포함 대부분 접근 가능)

## 공용(비로그인 가능)

### 마케팅/정보 페이지

- `/` - 홈페이지
- `/features` - 기능 소개
- `/how-it-works` - 사용법
- `/pricing` - 요금제
- `/about` - 회사 소개
- `/contact` - 문의
- `/demo` - 데모

### 정책 페이지

- `/privacy` - 개인정보처리방침
- `/terms` - 이용약관

### 기타

- `/help` - 도움말
- `/status` - 서비스 상태

### 인증 페이지

- `/login` - 로그인
- `/signup` - 회원가입
- `/forgot-password` - 비밀번호 찾기

## 공통(로그인 필요, 라우트는 공유 · UI/권한은 역할별 분기)

### 공유 라우트

- `/dashboard` - 대시보드 (역할별 다른 컴포넌트/섹션 렌더)
- `/problems` - 문제 목록 (학생: 풀이 중심, 교사: 관리 링크 추가)
- `/profile` - 프로필 (표시/편집 필드가 역할별로 다름)
- `/settings` - 공통 설정

### 역할별 전용 라우트

       - `/problems/[id]` - 문제 풀이 페이지 (학생 전용, 독립적 문제 풀이)
       - `/problems/[id]/manage` - 문제 관리 페이지 (교사/관리자 전용)
       - `/problems/[id]/review` - 오답체크 페이지 (학생 전용, 독립적 문제 해설)

### 가드 규칙

- 비인증 시 `/login` 리다이렉트
- 모든 (afterLogin) 페이지에서 `getServerSession`로 세션 확인

## 학생(STUDENT) 전용 라우트

### 학습 관련

- `/my/learning` - 단원별 학습 목록
- `/my/learning/[studyId]/problems` - 특정 단원의 문제 목록
  - 진행률 표시
  - 문제별 시도 상태 표시
  - 문제 풀기/다시 풀기/오답체크 버튼
    - `/my/learning/[studyId]/problems/[problemId]` - 단원 내 문제 풀이
      - 학습 맥락 유지
      - 단원 진행률 표시
      - 자연스러운 뒤로가기
    - `/my/learning/[studyId]/problems/[problemId]/review` - 단원 내 오답체크
      - 학습 맥락 유지
      - 단원 내 문제 해설 및 재풀이

### 리포트 및 설정

- `/my/reports` - 나의 학습 리포트 (LLM 분석 요약)
- `/my/settings` - 나의 설정

### 가드 규칙

- 학생 전용 페이지는 `role === 'STUDENT'` 아닌 경우 `/dashboard`로 이동
- 교사용 전용 페이지 접근 시 `/problems`로 리다이렉트

## 교사(TEACHER) 전용 라우트

### 학습 자료 관리

- `/learning-materials` - 학습 자료 관리
- `/teacher-reports` - 교사 리포트 생성/관리

### 학생 관리

- `/students` - 학생 관리
- `/reports` - 분석 리포트

### 도구

- `/vector-search` - 벡터 검색 도구

### 가드 규칙

- 학생이면 접근 불가 → `/problems`로 리다이렉트
- 미인증이면 `/login`으로 리다이렉트

## 관리자(ADMIN) 전용 라우트

- `/admin` - 관리자 페이지 (및 하위)
- 상위 권한으로서 교사용 페이지 대부분 접근 가능

### 가드 규칙

- `role === 'ADMIN'`가 아닌 경우 접근 불가 → `/dashboard`로 리다이렉트

## 라우팅 구조도

```
/ (홈)
├── /login, /signup, /forgot-password (인증)
├── /features, /pricing, /about... (마케팅)
└── /dashboard (로그인 후)

로그인 후:
├── 공통 라우트
│   ├── /dashboard (역할별 UI)
│   ├── /problems (역할별 동작)
│   ├── /profile (역할별 필드)
│   └── /settings
│
├── 역할별 전용 라우트
│   ├── /problems/[id] (학생: 문제 풀이)
│   ├── /problems/[id]/manage (교사: 문제 관리)
│   └── /problems/[id]/review (학생: 오답체크)
│
       ├── 학생 전용
       │   ├── /my/learning (학습 목록)
       │   │   ├── /my/learning/[studyId]/problems (단원별 문제)
       │   │   ├── /my/learning/[studyId]/problems/[problemId] (단원 내 문제 풀이)
       │   │   └── /my/learning/[studyId]/problems/[problemId]/review (단원 내 오답체크)
       │   ├── /my/reports
       │   └── /my/settings
│
├── 교사 전용
│   ├── /learning-materials
│   ├── /teacher-reports
│   ├── /students
│   ├── /reports
│   └── /vector-search
│
└── 관리자 전용
    └── /admin
```

## 구현 패턴

### 라우트 공유 전략

- 라우트는 가급적 공유하고, 페이지 내부에서 역할별 UI를 조건부 렌더
- 전용 라우트는 IA/권한이 뚜렷이 다른 소수 페이지만 유지

### 인증 가드 예시

```typescript
// 서버 컴포넌트에서
const session = await getServerSession(authOptions);
if (!session?.user?.id) redirect('/login');

// 역할별 가드
if (session.user.role !== 'STUDENT') redirect('/dashboard');
if (session.user.role === 'STUDENT') redirect('/problems');
if (session.user.role !== 'ADMIN') redirect('/dashboard');
```

### 네비게이션 표시 정책

- 헤더/사이드바 메뉴는 역할에 따라 조건부 노출
- 학생: `my/*`, `problems`
- 교사: `learning-materials`, `students`, `reports`, `teacher-reports`
- 관리자: `admin` + 교사용 메뉴

## 참고 소스 경로

### 페이지 컴포넌트

- 학습 목록: `src/app/(afterLogin)/my/learning/page.tsx`
- 단원별 문제 목록: `src/app/(afterLogin)/my/learning/[studyId]/problems/page.tsx` - 단원 내 문제 풀이: `src/app/(afterLogin)/my/learning/[studyId]/problems/[problemId]/page.tsx` - 단원 내 오답체크: `src/app/(afterLogin)/my/learning/[studyId]/problems/[problemId]/review/page.tsx` - 문제 풀이 (학생): `src/app/(afterLogin)/problems/[id]/page.tsx` - 문제 관리 (교사): `src/app/(afterLogin)/problems/[id]/manage/page.tsx` - 오답체크 (학생): `src/app/(afterLogin)/problems/[id]/review/page.tsx`
- 학습 자료 관리: `src/app/(afterLogin)/learning-materials/page.tsx`
- 대시보드: `src/app/(afterLogin)/dashboard/page.tsx`

### 유틸리티

- 인증 가드: `src/lib/core/auth.ts`
- 미들웨어: `src/middleware.ts`
- 네비게이션: `src/components/dashboard/nav.ts`

## 라우팅 Best Practices

### 1. 계층적 구조

- 관련된 기능들을 계층적으로 구성
- URL만 봐도 기능을 파악할 수 있도록 설계

### 2. 역할 기반 접근 제어

- 미들웨어에서 기본적인 권한 체크
- 페이지 레벨에서 세부 권한 검증

### 3. 사용자 경험

- 자연스러운 뒤로가기 흐름
- 적절한 리다이렉트 처리
- 로딩 상태 및 에러 처리

### 4. 확장성

- 새로운 역할 추가 시 기존 구조 유지
- 기능 추가 시 기존 라우팅에 영향 최소화
