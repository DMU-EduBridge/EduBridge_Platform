# EduBridge Platform

AI 기반 교육 플랫폼. 교사와 학생을 연결하고 개인화된 학습/분석 기능을 제공합니다.

## 주요 기능

- AI 튜터: 개인화 문제/자료 추천, 학습 경로 가이드
- 대시보드: 학습 현황/지표 카드, 최근 활동, 빠른 액션
- 문제/자료 관리: 문제 생성·수정·검색, 학습 자료 API
- 학생 관리: 진행률/평균 점수/완료 개수 집계, 관심사 기반 태그
- 리포트: 분석 리포트 생성/목록 조회, 인사이트/추천 항목 저장
- 인증/권한: NextAuth, 라우트 가드 미들웨어, 역할 기반 보호
- 업로드: 파일 크기·MIME 제한 및 파일명 정규화

## 기술 스택

- **Framework**: Next.js 14 (App Router), TypeScript, Turbopack(dev)
- **UI**: Tailwind CSS, Radix UI, Lucide React
- **State/Data**: React Query v5
- **Auth**: NextAuth.js
- **DB/ORM**: Prisma + SQLite(dev) → 다른 DB로 교체 가능

## 빠른 시작

1. 저장소 클론

```bash
git clone <repository-url>
cd research-match-platform
```

2. 의존성 설치

```bash
npm install
```

3. 환경변수 설정

```bash
# 예시 파일을 로컬 환경 파일로 복사
cp .env.example .env.local
```

`.env.local`에서 필요한 값 설정:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-strong-secret

# Database (기본: 로컬 SQLite)
DATABASE_URL="file:./dev.db"
```

4. DB 마이그레이션/시드(선택)

```bash
npx prisma migrate dev
npm run db:seed
```

5. 개발 서버

```bash
npm run dev     # Turbopack 사용(빠른 HMR)
```

6. 프로덕션 빌드/실행

```bash
npm run build
npm start
```

## 👥 사용자 시나리오

- 교사: 문제/자료 관리 → 학생 진행률/점수 확인 → 리포트 생성/검토 → 맞춤 추천 제공
- 학생: 개인화 문제 풀이 → 실시간 피드백 확인 → 약점 개선 학습 경로 따라가기

## 주요 스크립트

```bash
npm run dev          # 개발 서버(Turbopack)
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 실행
npm run lint         # ESLint 검사
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포맷팅
npm run type-check   # TypeScript 타입 검사
npm run db:seed      # Prisma 시드
npm run db:reset     # DB 리셋 + 시드
```

## 프로젝트 구조(요약)

```
src/
├─ app/
│  ├─ (afterLogin)/           # 로그인 이후 페이지 그룹(공통 레이아웃 적용)
│  │  ├─ dashboard/
│  │  ├─ problems/
│  │  ├─ profile/
│  │  ├─ reports/
│  │  └─ students/
│  │  └─ layout.tsx
│  ├─ api/                    # API 라우트(문제/학생/리포트 등)
│  ├─ login/                  # 로그인
│  ├─ signup/                 # 회원가입
│  ├─ demo/                   # 데모 페이지
│  └─ layout.tsx              # 루트 레이아웃
├─ components/
│  ├─ dashboard/
│  ├─ landing/
│  ├─ layout/
│  └─ ui/
├─ lib/                       # 유틸/클라이언트/Prisma 등
├─ types/
└─ middleware.ts
```

## 보안/비밀관리

- `.env`, `.env.*`는 커밋 금지(.gitignore 적용). 대신 `.env.example`만 공개합니다.
- 로컬 DB 파일(`prisma/dev.db`)과 생성물(`.next/`, `public/uploads/`, `dist/`, `coverage/`)은 제외됩니다.

## 코드 품질

- ESLint + Prettier 구성, GitHub Actions(CI)로 lint/type-check/build 수행

## 라이선스/문의

- MIT (필요 시 `LICENSE` 추가)
- 이슈/PR 환영합니다.
