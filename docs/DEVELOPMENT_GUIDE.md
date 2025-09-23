# EduBridge Platform - 개발 가이드

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 구조 이해](#프로젝트-구조-이해)
3. [데이터베이스 작업](#데이터베이스-작업)
4. [API 개발 가이드](#api-개발-가이드)
5. [프론트엔드 개발 가이드](#프론트엔드-개발-가이드)
6. [AI 서버 연동 가이드](#ai-서버-연동-가이드)
7. [테스트 가이드](#테스트-가이드)
8. [배포 가이드](#배포-가이드)

## ⚙️ 개발 환경 설정

### 1. 필수 요구사항

```bash
# Node.js 18+ 설치 확인
node --version  # v18.0.0+

# npm 또는 yarn 설치 확인
npm --version   # 8.0.0+
# 또는
yarn --version  # 1.22.0+
```

### 2. 프로젝트 클론 및 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd EduBridge

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

### 3. 환경 변수 설정

```env
# .env.local 파일
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI 서버 설정 (선택사항)
CHROMA_URL="http://localhost:8000"
EDUCATIONAL_AI_URL="http://localhost:8000"
TEACHER_REPORT_URL="http://localhost:8001"

# OpenAI API (공통 API 키 - 두 AI 서버 모두 사용)
OPENAI_API_KEY="your-openai-api-key"
```

#### 🔑 **API 키 통합 정책**

- **`OPENAI_API_KEY`**: Educational AI System과 Teacher Report System 모두 사용하는 공통 API 키
- **`ANTHROPIC_API_KEY`**: 향후 확장을 위한 Anthropic API 키 (선택사항)

#### 🌐 **AI 서버 URL**

- **`EDUCATIONAL_AI_URL`**: Educational AI System 서버 주소 (기본값: http://localhost:8000)
- **`TEACHER_REPORT_URL`**: Teacher Report System 서버 주소 (기본값: http://localhost:8001)
- **`CHROMA_URL`**: ChromaDB 벡터 데이터베이스 주소 (기본값: http://localhost:8000)

### 4. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate

# 시드 데이터 생성
npm run db:seed

# Prisma Studio 실행 (선택사항)
npm run db:studio
```

### 5. 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

## 🏗️ 프로젝트 구조 이해

### 1. Next.js App Router 구조

```
src/app/
├── (afterLogin)/          # 로그인 후 페이지 그룹
│   ├── layout.tsx         # 로그인 후 공통 레이아웃
│   ├── admin/             # 관리자 전용 페이지
│   ├── dashboard/         # 대시보드
│   ├── my/                # 개인 페이지
│   └── ...
├── api/                   # API 라우트
│   ├── auth/              # 인증 관련 API
│   ├── ai/                # AI 관련 API
│   ├── textbooks/         # 교과서 API
│   └── ...
├── login/                 # 로그인 페이지
├── signup/               # 회원가입 페이지
└── layout.tsx            # 루트 레이아웃
```

### 2. 컴포넌트 구조

```
src/components/
├── ui/                    # 재사용 가능한 UI 컴포넌트
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── layout/                # 레이아웃 컴포넌트
│   ├── header.tsx
│   └── footer.tsx
├── dashboard/             # 대시보드 전용 컴포넌트
├── ai/                    # AI 관련 컴포넌트
└── ...
```

### 3. 서비스 계층 구조

```
src/
├── services/              # 클라이언트 서비스
│   ├── auth.ts
│   ├── problems.ts
│   └── ...
├── server/                # 서버 사이드 로직
│   ├── services/          # 비즈니스 로직
│   ├── repositories/      # 데이터 접근 계층
│   └── dto/               # 데이터 전송 객체
└── lib/                   # 유틸리티 라이브러리
    ├── core/              # 핵심 기능
    ├── utils/              # 유틸리티 함수
    └── ...
```

## 🗄️ 데이터베이스 작업

### 1. 스키마 수정

```prisma
// prisma/schema.prisma 파일 수정
model User {
  id    String @id @default(cuid())
  name  String
  email String @unique
  // 새로운 필드 추가
  phone String?
}
```

### 2. 마이그레이션 생성 및 적용

```bash
# 마이그레이션 생성
npm run db:migrate

# 마이그레이션 적용
npx prisma migrate deploy
```

### 3. 시드 데이터 수정

```typescript
// prisma/seed.ts 파일 수정
const users = await Promise.all([
  prisma.user.create({
    data: {
      name: '새로운 사용자',
      email: 'new@example.com',
      role: 'STUDENT',
      // 새로운 필드 추가
      phone: '010-1234-5678',
    },
  }),
]);
```

### 4. 데이터베이스 리셋

```bash
# 데이터베이스 완전 리셋 (주의!)
npm run db:reset

# 또는 개별 실행
npx prisma migrate reset --force
npm run db:seed
```

## 🔌 API 개발 가이드

### 1. 새로운 API 엔드포인트 생성

```typescript
// src/app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/core/auth';
import { z } from 'zod';

// 요청 스키마 정의
const RequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTHENTICATION_ERROR' } },
        { status: 401 },
      );
    }

    // 요청 데이터 검증
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);

    // 비즈니스 로직 처리
    // ...

    // 응답 반환
    return NextResponse.json({
      success: true,
      message: '요청이 성공적으로 처리되었습니다',
      data: result,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
```

### 2. API 라우트 패턴

```typescript
// GET /api/resource
export async function GET(request: NextRequest) {
  // 목록 조회
}

// POST /api/resource
export async function POST(request: NextRequest) {
  // 생성
}

// GET /api/resource/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // 상세 조회
}

// PUT /api/resource/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // 수정
}

// DELETE /api/resource/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // 삭제
}
```

### 3. 에러 처리 패턴

```typescript
// 공통 에러 처리 함수
function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '요청 데이터가 올바르지 않습니다',
          details: error.errors,
        },
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다',
      },
    },
    { status: 500 },
  );
}
```

## 🎨 프론트엔드 개발 가이드

### 1. 새로운 페이지 생성

```typescript
// src/app/(afterLogin)/new-page/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 데이터 로딩
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/new-endpoint');
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">새로운 페이지</h1>
      <Card>
        <CardHeader>
          <CardTitle>데이터 표시</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 데이터 렌더링 */}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. React Query 사용

```typescript
// src/hooks/new-hook.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 데이터 조회 훅
export function useNewData() {
  return useQuery({
    queryKey: ['new-data'],
    queryFn: async () => {
      const response = await fetch('/api/new-endpoint');
      const result = await response.json();
      return result.data;
    },
  });
}

// 데이터 생성/수정 훅
export function useNewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/new-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['new-data'] });
    },
  });
}
```

### 3. 컴포넌트 개발 패턴

```typescript
// src/components/new-component.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewComponentProps {
  title: string;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function NewComponent({ title, onSubmit, loading = false }: NewComponentProps) {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Input
        placeholder="입력하세요"
        value={formData.value || ''}
        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
      />
      <Button type="submit" disabled={loading}>
        {loading ? '처리 중...' : '제출'}
      </Button>
    </form>
  );
}
```

## 🤖 AI 서버 연동 가이드

### 1. 현재 시뮬레이션 모드

```typescript
// src/app/api/questions/route.ts
export async function POST(request: NextRequest) {
  // 현재는 시뮬레이션으로 동작
  const mockResponse = {
    questions: [
      {
        id: 'q_1',
        questionText: '생성된 문제...',
        // ... 기타 필드
      },
    ],
    totalCost: 0.25,
    generationTime: 5000,
  };

  return NextResponse.json({
    success: true,
    data: mockResponse,
  });
}
```

### 2. 실제 AI 서버 연동 준비

```typescript
// src/lib/ai-server/client.ts
class AIServerClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async generateQuestions(prompt: string, context: string[]) {
    const response = await fetch(`${this.baseUrl}/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });

    return response.json();
  }

  async searchContext(query: string, limit: number = 10) {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    });

    return response.json();
  }
}
```

### 3. ChromaDB 연동

```typescript
// src/lib/vector/chromadb.ts
import { ChromaClient } from 'chromadb';

class ChromaDBService {
  private client: ChromaClient;

  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000',
    });
  }

  async addDocuments(collectionName: string, documents: string[]) {
    const collection = await this.client.getCollection(collectionName);
    return collection.add(documents);
  }

  async searchSimilar(collectionName: string, query: string, limit: number = 10) {
    const collection = await this.client.getCollection(collectionName);
    return collection.query({
      queryTexts: [query],
      nResults: limit,
    });
  }
}
```

## 🧪 테스트 가이드

### 1. API 테스트

```typescript
// tests/api/new-endpoint.test.ts
import { POST } from '@/app/api/new-endpoint/route';
import { NextRequest } from 'next/server';

describe('/api/new-endpoint', () => {
  it('should create new resource', async () => {
    const request = new NextRequest('http://localhost:3000/api/new-endpoint', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Resource',
        email: 'test@example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

### 2. 컴포넌트 테스트

```typescript
// tests/components/new-component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewComponent } from '@/components/new-component';

describe('NewComponent', () => {
  it('should render correctly', () => {
    render(<NewComponent title="Test Title" onSubmit={jest.fn()} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', () => {
    const mockSubmit = jest.fn();
    render(<NewComponent title="Test Title" onSubmit={mockSubmit} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### 3. 데이터베이스 테스트

```typescript
// tests/database/user.test.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User Model', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create user', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'STUDENT',
      },
    });

    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
  });
});
```

## 🚀 배포 가이드

### 1. 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run start
```

### 2. 환경 변수 설정

```env
# 프로덕션 환경 변수
DATABASE_URL="postgresql://user:password@localhost:5432/edubridge"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# AI 서버 URL
CHROMA_URL="https://chroma.your-domain.com"
EDUCATIONAL_AI_URL="https://ai.your-domain.com"
TEACHER_REPORT_URL="https://report.your-domain.com"
```

### 3. 데이터베이스 마이그레이션

```bash
# 프로덕션 데이터베이스 마이그레이션
npx prisma migrate deploy

# 시드 데이터 생성 (선택사항)
npm run db:seed
```

### 4. Docker 배포

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/edubridge
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=edubridge
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 📝 코딩 컨벤션

### 1. 파일 명명 규칙

- **컴포넌트**: PascalCase (`UserProfile.tsx`)
- **훅**: camelCase with `use` prefix (`useUserData.ts`)
- **유틸리티**: camelCase (`formatDate.ts`)
- **상수**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### 2. 코드 스타일

- **TypeScript**: 엄격한 타입 사용
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅
- **Import 순서**: 외부 라이브러리 → 내부 모듈

### 3. 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경
```

## 🔧 디버깅 가이드

### 1. 로그 확인

```typescript
// 서버 사이드 로깅
import { logger } from '@/lib/monitoring';

logger.info('API 호출 시작', { userId, endpoint });
logger.error('API 오류 발생', undefined, { error: error.message });
```

### 2. 개발자 도구 활용

- **Network 탭**: API 요청/응답 확인
- **Console 탭**: 클라이언트 사이드 로그
- **React DevTools**: 컴포넌트 상태 확인

### 3. Prisma Studio

```bash
# 데이터베이스 데이터 확인
npm run db:studio
```

---

**최종 업데이트**: 2025년 1월 21일  
**문서 버전**: 1.0.0  
**작성자**: EduBridge Development Team
